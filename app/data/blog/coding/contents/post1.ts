// post1.ts
import type { BlogPost } from '@/app/types/blog';
import {GLOBAL} from "@/app/constants";

export const post1: BlogPost = {
    id: 'baekjoon-1157',
    title: '백준-단어공부',
    date: '2025-05-29',
    md: `
     # 백준 단어공부


![문제](/images/coding-test/word.png)

## 해당 문제는 문자의 코드값에 대한 개념을 이해하면 쉽게 풀 수 있는 문제이다.
![문제](/images/coding-test/word-en.png)

### 문제풀이
1. 영문자 26개 단어에 대한 배열을 선언한다.
2. 문자열에 대한 반복문을 선언하여 모든 문자를 검사한다.
3. 대문자와 소문자에 문자 코드에 값이 다르므로 문기를 두어 선언해둔 배열에 인덱스를 값을 증가시킨다.

\`\`\`java
public static void main(String[] args) {
        // A 65 ~ 90
        // a 97 ~ 122
        Scanner sc = new Scanner(System.in);
        String word = sc.next();
        int[] arr = new int[26];

        // 65 - 65 - 26
        for (int i = 0; i < word.length(); i++) {

            // 대문자
            if (word.charAt(i) >= 65 && word.charAt(i) <= 90) {
                arr[word.charAt(i) - 65]++;
            // 소문자
            } else if (word.charAt(i) >= 97 && word.charAt(i) <= 122) {
                arr[word.charAt(i) - 97]++;
            }
        }
    }
\`\`\`


### 코드값 대신 문자로 대신해도 가능하다.

\`\`\`java
public class 단어공부 {

    public static void main(String[] args) {
        // A 65 ~ 90
        // a 97 ~ 122
        Scanner sc = new Scanner(System.in);
        String word = sc.next();
        int[] arr = new int[26];

        // 65 - 65 - 26
        for (int i = 0; i < word.length(); i++) {

            // 대문자
            if ('A' <= word.charAt(i) && word.charAt(i) <= 'Z') {
                arr[word.charAt(i) - 'A']++;
            // 소문자
            } else if ('a' <= word.charAt(i) && word.charAt(i) <= 'z') {
                arr[word.charAt(i) - 'a']++;
            }
        }

        int max = 0;
        char answer = '?';
        for (int i = 0; i < arr.length; i++) {
            if (arr[i] > max) {
                max = arr[i];
                answer = (char) (i + 'A');
            } else if (arr[i] == max) {
                answer = '?';
            }
        }

        System.out.println(answer);


    }
}
\`\`\`


`,
    excerpt: 'coding',
    tags: ['coding'],
    author: GLOBAL.NAME,
    coverImage: '/images/coding.png',
};
