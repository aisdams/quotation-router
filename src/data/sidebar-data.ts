import {
  Boxes,
  BoxesIcon,
  ClipboardEdit,
  ClipboardList,
  LayoutDashboard,
  Settings,
  Truck,
  Users,
} from 'lucide-react';

const sidebarData = [
  {
    title: 'Dashboard',
    link: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Quotation',
    link: '/quotation',
    icon: ClipboardEdit,
  },
  {
    title: 'Job Order',
    link: '/jo',
    icon: Boxes,
  },
  {
    title: 'Produk',
    icon: BoxesIcon,
    link: '#!',
    // submenu: [
    //   {
    //     title: "Ekspor",
    //     link: "/produk/ekspor"
    //   },
    //   {
    //     title: "Impor",
    //     link: "/produk/impor"
    //   },
    //   {
    //     title: "Katalog",
    //     link: "/produk/katalog"
    //   }
    // ]
  },
  {
    title: 'Pelanggan',
    icon: Users,
    link: '/pelanggan',
  },
  {
    title: 'Pesanan',
    icon: ClipboardList,
    link: '/pesanan',
  },
  {
    title: 'Pengiriman',
    icon: Truck,
    link: '/pengiriman',
  },
  {
    title: 'Pengaturan',
    icon: Settings,
    link: '#!',
    // submenu: [
    //   {
    //     title: "Profil",
    //     link: "/pengaturan/profil"
    //   },
    //   {
    //     title: "Pengguna",
    //     link: "/pengaturan/pengguna"
    //   }
    // ]
  },
];

export default sidebarData;
