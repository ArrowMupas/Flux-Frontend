import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { createColumnHelper, useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel } from '@tanstack/react-table';
import { motion } from 'framer-motion';
import ProductCard from '@/components/cards/ProductCard.jsx';
import useUserStore from '@/stores/userStore';
import ErrorState from '@/components/States/ErrorState';
import ProductCardSkeleton from '@/components/skeletons/ProductCardSkeleton';
import { Filter, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function ProductPage() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const isLoggedIn = !!user;

  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const {
    data: products = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await axios.get('/api/products');
      return res.data;
    },
  });

  const columnHelper = createColumnHelper();
  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Name',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('price', {
        header: 'Price',
        cell: (info) => info.getValue(),
      }),
    ],
    [columnHelper]
  );

  const table = useReactTable({
    data: products,
    columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: 'includesString',
  });

  const showProducts = table.getRowModel().rows.map((row) => row.original);

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
  };

  const handleSortChange = (criteria) => {
    switch (criteria) {
      case 'priceDesc':
        setSorting([{ id: 'price', desc: true }]);
        break;
      case 'priceAsc':
        setSorting([{ id: 'price', desc: false }]);
        break;
      case 'nameAsc':
        setSorting([{ id: 'name', desc: false }]);
        break;
      default:
        setSorting([]);
    }
    setShowDropdown(false);
  };

  return (
    <div className="min-h-screen py-5 bg-neutral">
      <div className="flex flex-col pb-20">
        <div className="relative flex-1">
          {/* Header */}
          <div className="flex flex-col items-start justify-between gap-4 px-4 py-6 md:flex-row md:items-center md:gap-0 md:px-20">
            <div>
              <h1 className="text-2xl font-semibold font-heading text-content md:text-3xl">Alas Menu and Spices</h1>
              <p className="text-lighter">From mild to wild - find your perfect heat level</p>
            </div>

            <div className="flex flex-row w-full gap-2 sm:w-auto sm:items-center">
              <div className='relative'>
                <Button variant="outline" size="lg" className="flex justify-center py-4 w-1/8 sm:w-auto sm:py-7"
                  onClick={() => setShowDropdown(!showDropdown)}>
                  <Filter className="size-6 sm:size-7" />
                    <span>Sort</span>
                  <ChevronDown className="size-5" />
                </Button>
                {/* Dropdown */}
                {showDropdown && (
                  <div className="absolute right-0 z-20 w-48 mt-2 text-black bg-white border rounded-md shadow-md">
                    <button
                      onClick={() => handleSortChange('priceDesc')}
                      className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                    >
                      Highest to Lowest
                    </button>
                    <button
                      onClick={() => handleSortChange('priceAsc')}
                      className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                    >
                      Lowest to Highest
                    </button>
                    <button
                      onClick={() => handleSortChange('nameAsc')}
                      className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                    >
                      Alphabetical (A–Z)
                    </button>
                  </div>
                )}
              </div>
              <Input
                type="text"
                placeholder="Search products..."
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-full py-4 bg-red-100 border-primary rounded-2xl sm:w-64 sm:py-6"
              />
            </div>
          </div>

          {/* Product Grid */}
          <div className="px-4 pb-20 mt-4 md:px-20">
            {isLoading ? (
              <div
                className={
                  isLoggedIn
                    ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    : 'grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                }
              >
                {[...Array(8)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : isError ? (
              <ErrorState error={isError} onRetry={refetch} title="Failed to load Products" retryText="Retry Request" />
            ) : (
              <div
                className={
                  isLoggedIn
                    ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    : 'grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                }
              >
                {showProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <ProductCard product={product} onAddToCart={handleAddToCart} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
