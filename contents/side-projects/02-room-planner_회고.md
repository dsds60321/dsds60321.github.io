# Room Planner 구현 회고: 실측 입력, 상태 관리, 도면 렌더링을 어떻게 단순화했나

앞선 글에서는 Room Planner를 왜 만들게 되었는지, 그리고 왜 "견적 플랫폼"이 아니라 "도면 실측 도구"로 범위를 제한했는지를 정리했다.  
이번 글에서는 그 의도를 실제 코드 구조로 어떻게 옮겼는지 정리해보려고 한다.

이 프로젝트는 Next.js 기반이지만, 핵심은 단순히 화면을 여러 개 만든 데 있지 않다.  
실측값 입력, 편집 상태 관리, 자동 저장, 결과 렌더링을 서로 충돌하지 않게 나누는 것이 더 중요했다.

## 1. 프로젝트 흐름을 먼저 고정했다

### [ 화면 순서가 곧 사용자 사고 흐름이 되도록 ]

이 프로젝트의 메인 흐름은 아래와 같다.

1. 집 선택
2. 도면 선택
3. 방 실측 입력
4. 평면 배치 편집
5. 결과 보기

이 순서는 단순한 라우팅 구성이 아니라, 사용자의 사고 순서를 그대로 반영한 것이다.  
예를 들어 편집 화면부터 먼저 열리면 사용자는 "무엇을 배치해야 하지?"라는 상태가 된다. 반대로 실측 입력을 먼저 두면, 편집은 이미 입력된 데이터를 정리하는 단계가 된다.

실제로 README에도 이 구조가 명시되어 있고, 각 페이지 역시 이 흐름을 그대로 따른다.

```text
집 선택 -> 도면 선택 -> 방 측정 -> 평면 편집 -> 결과 보기
```

여기서 중요한 점은 "캔버스 툴"을 만든 것이 아니라 "실측 데이터를 다루는 워크플로우"를 만든 것이라는 점이다.

## 2. 서버 상태와 편집 상태를 분리했다

### [ React Query와 Zustand를 역할별로 나눴다 ]

처음 이 프로젝트를 볼 때 헷갈릴 수 있는 부분은 상태 관리가 두 겹으로 보인다는 점이다.  
하지만 실제로는 의도적으로 역할을 나눈 구조이다.

- `React Query`: 서버에서 가져온 도면 문서를 로딩하고 저장 결과를 동기화
- `Zustand`: 편집 중인 방 목록, 선택된 방, 배치 상태, Undo/Redo 같은 즉시 반응 상태 관리

이 분리는 꽤 실용적이었다.  
서버 상태까지 모두 전역 스토어에 넣으면 네트워크 동기화와 UI 반응성이 서로 얽히기 쉽다. 반대로 편집 중 드래그 상태까지 Query에 얹으면 지나치게 무거워진다.

이 프로젝트의 `useActiveFloorplan` 훅은 그 중간을 연결하는 역할을 한다.

```ts
const documentQuery = useQuery({
  queryKey: ["floorplanDocument", homeId, floorplanId],
  queryFn: () => getFloorplanDocument(homeId, floorplanId),
});

useEffect(() => {
  if (!document) return;

  hydrateRooms(document.rooms, document.rooms[0]?.id ?? null, floorplanId);
  hydrateFloorPlan(document.placements, { documentKey: floorplanId });
}, [document, floorplanId, hydrateFloorPlan, hydrateRooms]);
```

이 코드는 서버에서 문서를 받아오면, 그 값을 편집용 스토어에 주입하는 흐름이다.  
즉, 서버 데이터는 원본 소스이고, Zustand는 사용자가 지금 만지고 있는 작업 버전이라고 볼 수 있다.

### [ 자동 저장은 단순한 방식이 더 잘 맞았다 ]

자동 저장 역시 복잡한 동기화 엔진 대신 비교적 단순한 전략을 택했다.

```ts
const nextDocument = {
  floorplanId,
  rooms,
  placements,
};
const nextSignature = JSON.stringify(nextDocument);

if (lastPersistedSignatureRef.current === nextSignature) {
  return;
}

const timeout = window.setTimeout(() => {
  saveDocument(nextDocument);
}, 500);
```

변경된 문서를 문자열 시그니처로 비교하고, 500ms 뒤 저장하는 식이다.  
정교한 충돌 해결이나 패치 단위 저장은 없지만, 토이프로젝트 규모에서는 오히려 이 단순함이 유지보수에 유리했다.

다만 한계도 분명하다.

- 문서 전체를 저장하므로 데이터가 커지면 비효율적일 수 있다.
- 동시 편집 시나리오는 고려하지 않았다.
- 세밀한 변경 이력은 서버가 아니라 클라이언트 메모리에만 남는다.

그래도 이번 프로젝트의 목표가 1인 사용자의 빠른 실측 정리였기 때문에, 이 정도 단순화는 충분히 합리적이었다.

## 3. 실측 입력은 "숫자 입력"보다 "잘못 넣기 어렵게"에 집중했다

### [ 도면 입력에서 더 중요한 것은 검증이다 ]

도면 관련 폼은 입력 필드만 많이 두는 것으로 끝나지 않는다.  
사용자가 넣은 숫자가 실제 벽 길이와 맞는지, 문이 벽 밖으로 나가지는 않는지 같은 검증이 더 중요하다.

이 프로젝트에서는 `Zod`를 사용해서 방 크기와 문 위치를 검증한다.

```ts
if (value.doorWidth > wallLength) {
  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    path: ["doorWidth"],
    message: "문 폭은 선택한 벽 길이보다 클 수 없습니다",
  });
}

if (resolvedDoorOffset + value.doorWidth > wallLength) {
  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    path: ["doorOffset"],
    message: "문 위치와 문 폭의 합이 벽 길이를 넘을 수 없습니다",
  });
}
```

여기서 핵심은 단순히 `required` 검사를 하는 것이 아니라, 도면 도메인 규칙 자체를 폼 검증으로 가져왔다는 점이다.  
즉, 사용자는 숫자를 입력하지만 시스템은 그 숫자가 실제 도면 규칙 안에 있는지까지 확인한다.

### [ 입력과 미리보기를 한 화면에 둔 이유 ]

방 실측 입력 화면에서는 오른쪽에 즉시 반영되는 미리보기가 있다.  
이 부분은 UX 측면에서 꽤 중요했다.

- 가로와 세로를 바꾸면 방 비율이 어떻게 달라지는지 바로 보인다.
- 문 위치 기준을 `start`, `center`, `end`로 바꿨을 때 차이를 눈으로 확인할 수 있다.
- 입력값이 숫자 목록으로만 남지 않고, 실제 도면 조각처럼 느껴진다.

결국 입력 화면은 폼이 아니라 "측정 결과를 검증하는 작업 공간"에 더 가깝게 만들고 싶었다.

## 4. 도면 렌더링은 복잡한 CAD보다 해석 가능한 구조를 택했다

### [ 방과 배치를 분리하면 생각보다 유연해진다 ]

이 프로젝트에서 방 데이터와 배치 데이터는 서로 분리되어 있다.

- `Room`: 방 자체의 크기와 문 정보
- `Placement`: 방이 평면 어디에 놓였는지에 대한 정보

이 구조 덕분에 같은 방 데이터를 유지한 채 배치만 바꿀 수 있다.  
다시 말해 "무엇을 그릴 것인가"와 "어디에 놓을 것인가"를 나눈 셈이다.

이 아이디어는 렌더링 함수에서도 그대로 드러난다.

```ts
export function resolvePlacedRooms(rooms: Room[], placements: Placement[]) {
  const placementMap = new Map(
    placements.map((placement) => [placement.roomId, placement]),
  );

  return rooms
    .map((room) => {
      const placement = placementMap.get(room.id);
      if (!placement || !placement.placed) {
        return null;
      }

      return {
        room,
        placement,
        x: placement.x,
        y: placement.y,
        width: room.width,
        depth: room.depth,
      };
    })
    .filter((room): room is RoomBounds => room !== null);
}
```

이렇게 해두면 방 크기는 실측값을 기준으로 유지되고, 캔버스에서는 배치 좌표만 바꿔서 다시 렌더링하면 된다.  
구조가 직관적이기 때문에 나중에 기능을 추가할 때도 부담이 적다.

### [ 벽은 방마다 따로 그리지 않고, 겹침을 판별해 정리했다 ]

평면도를 그릴 때 단순히 각 방의 사각형을 따로 그리면 내부 경계가 부자연스럽게 보이기 쉽다.  
그래서 이 프로젝트에서는 방의 각 변을 순회하면서, 다른 방과 닿는 면인지 아닌지를 판별해 외곽 벽과 내부 벽을 구분한다.

이 방식의 장점은 분명하다.

- 여러 방이 붙어 있어도 결과가 평면도처럼 보인다.
- 결과 화면에서 불필요한 중복 선이 줄어든다.
- 실측 데이터와 렌더링 로직의 연결이 단순하다.

해당 방법은 정교한 방법은 아니다.
단순한 벽과 벽이 닿는지를 계산하기만 하였다. 해당 프로젝트에 목적 자체가 단순한 도면 그리기에 그칠꺼라 생각해 진행하였다.

## 5. 출력 화면은 편집 화면과 역할을 분리했다

편집 화면은 선택 상태, 줌, 미니맵, 방 목록, 스냅 여부 같은 정보가 많다.  
반면 결과 화면은 그런 편집 정보보다 "전달 가능한 이미지"에 더 가까워야 한다.

그래서 결과 화면은 아래 요소 중심으로 정리했다.

- 외곽 벽과 내부 벽
- 문 스윙
- 방 이름
- 면적과 치수 요약
- PNG 다운로드와 인쇄

도면을 다운로드 후 테블릿 등으로 가구, 가전 배치등을 위해 기능을 구현했다.

## 6. 아쉬웠던 점과 다음에 보완하고 싶은 점

토이프로젝트로서는 만족스러웠지만, 구현하면서 아쉬운 지점도 분명히 보였다.

- 방 충돌 감지나 자동 정렬 같은 고급 배치 보조 기능은 아직 없다.
- 현재 방 형태는 사실상 직사각형 중심이다.
- 저장이 문서 전체 단위라 커질수록 부담이 생길 수 있다.

하지만 이번 프로젝트의 목적을 다시 떠올리면, 이런 한계는 대부분 "지금 당장 풀 문제는 아니었던 영역"에 가깝다.  
오히려 필요한 핵심 기능에 집중했기 때문에 여기까지 빠르게 도달할 수 있었다고 보는 편이 맞다.

## 7. 결과
도메인 : https://home-plan.crazevo.com <br>
GitHub : https://github.com/dsds60321/room-planer
![demo.gif](https://github.com/dsds60321/room-planer/blob/main/public/demo.gif)