// data/navigation/menuItems.ts
import { MenuItem } from '@/app/types/blog';

export const menuItems: MenuItem[] = [
    {
        title: '홈',
        path: '/',
        icon: '🏠',
    },
    {
        title: '블로그',
        path: '/blog',
        icon: '📝',
        submenu: [
            {
                title: 'Language',
                path: '/blog/lang',
                submenu: [
                    { title: 'Java', path: '/blog/lang/java' }
                ],
            },
            {
                title: 'Spring',
                path: '/blog/spring',
                submenu: [
                    { title: 'Spring', path: '/blog/spring' },
                    { title: 'WebFlux', path: '/blog/webflux' },
                    { title: 'JPA', path: '/blog/spring/jpa' }
                ],
            },
            {
                title: 'Netty',
                path: '/blog/netty',
                submenu: [
                    { title: 'netty', path: '/blog/netty' }
                ],
            },
            {
                title: 'MQ',
                path: '/blog/kafka',
                submenu: [
                    { title: 'kafka', path: '/blog/kafka' }
                ],
            },
            {
                title: 'JS',
                path: '/blog/js',
                submenu: [
                    { title: 'react', path: '/blog/js/react' }
                ],
            },
            {
                title: '코딩 테스트',
                path: '/blog/coding',
                submenu: [
                    { title: '코딩 테스트', path: '/blog/coding' }
                ],
            },
            {
                title: 'ETC',
                path: '/blog/etc',
                submenu: [
                    { title: '개발메모', path: '/blog/etc/memo' }
                ],
            }
        ],
    },
    {
        title: '포트폴리오',
        path: '/portfolio',
        icon: '💼',
    },
    {
        title: '소개',
        path: '/about',
        icon: '👋',
    },
];

export default menuItems;
