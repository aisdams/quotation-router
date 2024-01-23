

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Cost, JobOrder } from '@/types';
import { useQuery } from '@tanstack/react-query';
import {
  ColumnDef,
  ColumnFiltersState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import ApexCharts, { ApexOptions } from 'apexcharts';
import {
  ArrowUpDown,
  ChevronDown,
  Edit2,
  Eye,
  Home,
  Menu,
  MoreHorizontal,
  Plane,
  Printer,
  Trash,
  Truck,
} from 'lucide-react';
import { toast } from 'react-toastify';

import * as CostService from '@/apis/cost.api';
import * as customerService from '@/apis/customer.api';
import * as JobOrderService from '@/apis/jo.api';
import * as quotationService from '@/apis/quotation.api';
import { getErrMessage } from '@/lib/utils';
import MyChatBot from '@/components/chatbot';
import ReactTable from '@/components/table/react-table';
import { Button } from '@/components/ui/button';
// import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});

const columnHelper = createColumnHelper<JobOrder>();

const columnsDef = [
  columnHelper.accessor('jo_no', {
    enableSorting: false,
    header: () => (
      <div>
        <div>#JO NO</div>
        <div>DATE</div>
      </div>
    ),
    cell: (info) => {
      const date = new Date(info.row.original.createdAt);
      const formattedDate = `${date.getDate()}/${
        date.getMonth() + 1
      }/${date.getFullYear()}`;

      return (
        <div>
          <div>{info.row.original.jo_no}</div>
          <div>{formattedDate}</div>
        </div>
      );
    },
  }),
  // columnHelper.accessor('quo_no', {
  columnHelper.display({
    id: 'sales',
    enableSorting: false,
    header: () => (
      <div>
        <div>QUO NO</div>
        <div>SALES</div>
      </div>
    ),
    cell: (info) => {
      const [sales, setSales] = useState('');

      useEffect(() => {
        const quoNo = info.row.original.quo_no.toString();

        quotationService.getById(quoNo).then((quotation) => {
          if (quotation && quotation.data && quotation.data.sales) {
            setSales(quotation.data.sales);
          }
        });
      }, []);

      return (
        <div>
          <div>{info.row.original.quo_no}</div>
          <div>{sales}</div>
        </div>
      );
    },
  }),
  columnHelper.display({
    header: 'TYPE',
    cell: (info) => {
      const [type, setType] = useState('');

      useEffect(() => {
        const quoNo = info.row.original.quo_no.toString();

        quotationService.getById(quoNo).then((quotation) => {
          if (quotation && quotation.data && quotation.data.type) {
            setType(quotation.data.type);
          }
        });
      }, []);

      return (
        <div>
          <div>{type}</div>
        </div>
      );
    },
  }),
  columnHelper.accessor('customer_code', {
    header: 'CUSTOMER',
    cell: (info) => {
      const [partner_name, setPartnerName] = useState('');

      useEffect(() => {
        const customer_code = info.row.original.customer_code.toString();

        customerService.getById(customer_code).then((customer) => {
          if (customer && customer.data && customer.data.partner_name) {
            setPartnerName(customer.data.partner_name);
          }
        });
      }, []);

      return (
        <div>
          <div>{partner_name}</div>
        </div>
      );
    },
  }),
  columnHelper.display({
    id: 'hbl',
    header: () => (
      <div>
        <div>HBL/HAWB</div>
        <div>MBL/MAWB</div>
      </div>
    ),
    cell: (info) => (
      <div>
        <div>{info.row.original.hbl}</div>
        <div>{info.row.original.mbl}</div>
      </div>
    ),
  }),
  columnHelper.accessor('quo_no', {
    enableSorting: false,
    header: () => (
      <div>
        <div>LOADING</div>
        <div>DISCHARGE</div>
      </div>
    ),
    cell: (info) => {
      const [loading, setLoading] = useState('');
      const [discharge, setDischarge] = useState('');

      useEffect(() => {
        const quoNo = info.row.original.quo_no.toString();

        quotationService.getById(quoNo).then((quotation) => {
          if (quotation && quotation.data && quotation.data.loading) {
            setLoading(quotation.data.loading);
          }
        });

        quotationService.getById(quoNo).then((quotation) => {
          if (quotation && quotation.data && quotation.data.discharge) {
            setDischarge(quotation.data.discharge);
          }
        });
      }, []);

      return (
        <div>
          <div>{loading}</div>
          <div>{discharge}</div>
        </div>
      );
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: 'ACTIONS',
    cell: (info) => {
      const router = useRouter();
      const [isOpenJOmodal, setIsOpenJOModal] = useState(false);
      const [JOData, setJOData] = useState<JobOrder | null>(null);
      const [selectedJO, setSelectedJO] = useState<JobOrder | null>(null);

      const id = info.row.original.jo_no.toString();
      const [joCode, setJOCode] = useState('');

      const closeJOModal = () => {
        setIsOpenJOModal(false);
      };

      const fetchData = () => {
        let setId;
        if (typeof id === 'string') {
          setId = id;
        } else if (Array.isArray(id)) {
          setId = id[0];
        } else {
          throw new Error('Invalid ID');
        }

        if (setId) {
          return JobOrderService.getById(setId);
        } else {
          throw new Error('Invalid ID');
        }
      };

      const joQuery = useQuery({
        queryKey: ['joc'],
        queryFn: fetchData,
        keepPreviousData: true,
        onError: (err) => {
          console.log(`Error, ${getErrMessage(err)}`);
        },
      });

      const openJOModal = () => {
        setIsOpenJOModal(true);

        fetch(`http://localhost:8089/api/jo/${id}`)
          .then((response) => response.json())
          .then((data) => {
            setJOData(data.data);
          })
          .catch((error) => {
            console.error('Error:', error);
          });
      };

      useEffect(() => {
        if (selectedJO) {
          setJOCode(selectedJO.jo_no);
        } else {
          setJOCode('');
        }
      }, [selectedJO]);

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="mx-auto grid h-8 w-8 items-center justify-center !bg-transparent p-0 data-[state=open]:bg-muted">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4 !bg-transparent" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="font-normal">
              <DropdownMenuItem className="p-0">
                <Button
                  onClick={openJOModal}
                  className="flex w-full select-none items-center !bg-transparent bg-none px-2 py-1.5 !text-black hover:cursor-default hover:!text-white"
                >
                  <Eye className="mr-2 h-3.5 w-3.5 text-darkBlue hover:!text-white" />
                  See Detail
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isOpenJOmodal && JOData && (
            <div
              style={{ overflow: 'hidden' }}
              className={`modal fixed inset-0 z-50 flex items-center justify-center ${
                isOpenJOmodal ? 'open' : 'closed'
              }`}
            >
              <div className="absolute inset-0 bg-black opacity-75"></div>
              <div className="relative z-10 w-1/3 rounded-lg bg-white p-4 shadow-lg">
                <Button
                  className="absolute -top-9 right-0 !bg-red-500 text-xl text-white"
                  onClick={closeJOModal}
                  type="button"
                >
                  X
                </Button>
                <Table>
                  <TableHeader>
                    <TableRow className="!bg-bluePrimary !text-white">
                      <TableHead className="hover:!text-white">
                        Shipper
                      </TableHead>
                      <TableHead className="hover:!text-white">
                        consignee
                      </TableHead>
                      <TableHead className="hover:!text-white">hbl</TableHead>
                      <TableHead className="hover:!text-white">mbl</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="text-black">
                    <TableRow key={JOData.jo_no}>
                      <TableCell className="!h-2 !w-2 rounded-md">
                        {JOData.shipper}
                      </TableCell>
                      <TableCell className="!h-2 !w-2 rounded-md">
                        {JOData.consignee}
                      </TableCell>
                      <TableCell className="!h-2 !w-2 rounded-md">
                        {JOData.hbl}
                      </TableCell>
                      <TableCell className="!h-2 !w-2 rounded-md">
                        {JOData.mbl}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* {isOpenJOmodal && JOData && (
            <div>
              <h2>JO Data:</h2>
              <p>JO No: {JOData.shipper}</p>
              <p>Consigne: {JOData.consignee}</p>
              <p>ETD: {JOData.etd}</p>
            </div>
          )} */}
        </>
      );
    },
  }),
];

export default function Content() {
  const router = useRouter();
  const [costData, setCostData] = useState<Cost[]>([]);
  const [totalPrice, setTotalPrice] = useState<string>('0');
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const columns = useMemo(() => columnsDef, []);
  const defaultData = useMemo(() => [], []);

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 15,
  });

  const fetchDataOptions = {
    page: pageIndex + 1,
    limit: pageSize,
  };

  const JobOrdersQuery = useQuery({
    queryKey: ['JobOrders', fetchDataOptions],
    queryFn: () => JobOrderService.getAll(fetchDataOptions),
    keepPreviousData: true,
    onError: (err) => {
      toast.error(`Error, ${getErrMessage(err)}`);
    },
  });

  const options: ApexOptions = {
    chart: {
      height: 150,
      type: 'line',
      zoom: {
        enabled: true,
      },
      foreColor: '#5a75d7',
    },
  };

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const optionsTwo: ApexOptions = {
    chart: {
      height: 350,
      type: 'bar',
      zoom: {
        enabled: true,
      },
      foreColor: '#5a75d7',
    },
  };

  const series = [
    {
      name: 'JO',
      data: [31, 40, 28, 51, 42, 109, 100],
    },
    {
      name: 'QUOTATION',
      data: [11, 32, 45, 32, 34, 52, 41],
    },
  ];

  const seriesTwo = [
    {
      name: 'Tikus',
      data: [1, 10, 37, 42, 56, 88, 100],
    },
    {
      name: 'Kucing',
      data: [11, 32, 45, 32, 34, 52, 41],
    },
  ];

  const table = useReactTable({
    columns,
    data: JobOrdersQuery.data?.data || [],
    pageCount: JobOrdersQuery.data?.pagination.total_page ?? -1,

    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    meta: {},
  });

  useEffect(() => {
    const dataCost = () => {
      fetch('http://localhost:8089/api/cost')
        .then((response) => response.json())
        .then((data) => {
          setCostData(data.data);

          const total = data.data.reduce(
            (accumulator: any, cost: any) =>
              accumulator + parseFloat(cost.price),
            0
          );

          setTotalPrice(total);
        });
    };

    dataCost();
  }, []);

  const dataCost = () => {
    fetch('http://localhost:8089/api/cost')
      .then((response) => response.json())
      .then((data) => {
        setCostData(data.data);
        const total = data.data.reduce(
          (accumulator: any, cost: any) => accumulator + cost.price,
          0
        );
        setTotalPrice(total.toString().replace(/^0+/, ''));
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <div className="grid">
      <div className="z-[99] mb-10 mt-5 flex items-center gap-3 font-semibold">
        <Home className="text-blueLight" />
        <h1>Dashboard</h1>
      </div>
      <div className="mb-5 grid gap-5 lg:grid-cols-[1fr_2fr_1fr]">
        <div className="w-full gap-3 rounded-md border-2 border-graySecondary/50 p-3 pt-10 text-center  text-darkBlue dark:bg-secondDarkBlue dark:text-white">
          <Truck className="mx-auto grid " size={34} />
          <p>Rp. {totalPrice}</p>
          <h2 className="font-bold">Total Price.</h2>
        </div>

        <div className="w-full rounded-md border-2 border-graySecondary/50 px-5 py-1 dark:bg-secondDarkBlue">
          <ReactApexChart
            options={options}
            series={series}
            type="line"
            height={150}
          />
        </div>

        <div className="w-full gap-3 rounded-md border-2 border-graySecondary/50 p-3 pt-10 text-center font-bold text-darkBlue dark:bg-secondDarkBlue dark:text-white">
          <Plane className="mx-auto grid " size={34} />
          <h2 className="font-light">310 Total Export/Import</h2>
          <h2>Lorem ipsum dolor sit amet..</h2>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="mt-5 rounded-md border-2 border-graySecondary/50 dark:bg-secondDarkBlue">
          <ReactApexChart options={optionsTwo} series={seriesTwo} type="bar" />
        </div>
        {/* list jo dan joc */}
        <div className="relative">
          <h1 className="absolute left-5 top-5 font-bold">Job Order</h1>

          <ReactTable
            tableInstance={table}
            isLoading={JobOrdersQuery.isFetching}
          />
        </div>
      </div>

      {/* <Chatbot /> */}
    </div>
  );
}
