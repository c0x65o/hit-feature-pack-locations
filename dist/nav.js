/**
 * Navigation contributions for locations feature pack
 */
export const navContributions = [
    {
        id: 'locations',
        label: 'Locations',
        path: '/locations',
        icon: 'MapPin',
        children: [
            {
                id: 'locations-dashboard',
                label: 'Dashboard',
                path: '/locations',
                icon: 'LayoutDashboard',
            },
            {
                id: 'locations-list',
                label: 'All Locations',
                path: '/locations/list',
                icon: 'MapPin',
            },
            {
                id: 'locations-types',
                label: 'Location Types',
                path: '/locations/types',
                icon: 'Tag',
            },
        ],
    },
];
//# sourceMappingURL=nav.js.map