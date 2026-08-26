'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export function ListingFilters() {

  const router = useRouter();
  const searchParams = useSearchParams();


  const [minPrice, setMinPrice] = useState(
    searchParams.get('minPrice') ?? ''
  );

  const [maxPrice, setMaxPrice] = useState(
    searchParams.get('maxPrice') ?? ''
  );

  const [featured, setFeatured] = useState(
    searchParams.get('featured') === 'true'
  );


function applyFilters() {
  const min = minPrice ? Number(minPrice) : null;
  const max = maxPrice ? Number(maxPrice) : null;

  if (min !== null && (!Number.isFinite(min) || min < 0)) {
    alert('Minimum price must be a valid positive number.');
    return;
  }

  if (max !== null && (!Number.isFinite(max) || max < 0)) {
    alert('Maximum price must be a valid positive number.');
    return;
  }

  if (min !== null && max !== null && min > max) {
    alert('Minimum price cannot be greater than maximum price.');
    return;
  }

  const params = new URLSearchParams(
    searchParams.toString()
  );

  if (minPrice) {
    params.set('minPrice', minPrice);
  } else {
    params.delete('minPrice');
  }

  if (maxPrice) {
    params.set('maxPrice', maxPrice);
  } else {
    params.delete('maxPrice');
  }

  if (featured) {
    params.set('featured', 'true');
  } else {
    params.delete('featured');
  }

  params.delete('page');

  router.push(`/browse?${params.toString()}`);
}
function clearFilters() {
  const params = new URLSearchParams(searchParams.toString());

  params.delete('minPrice');
  params.delete('maxPrice');
  params.delete('featured');
  params.delete('page');

  setMinPrice('');
  setMaxPrice('');
  setFeatured(false);

  router.push(`/browse?${params.toString()}`);
}
const hasFilters =
  minPrice !== '' ||
  maxPrice !== '' ||
  featured;

  return (

    <div className="rounded-2xl border border-border bg-card p-5">

      <h2 className="mb-4 font-semibold">
        Filters
      </h2>


      <div className="grid gap-3 sm:grid-cols-2">


        <input
  value={minPrice}
  onChange={(e) => setMinPrice(e.target.value)}
  placeholder="Min price"
  type="number"
  min="0"
  step="1"
  className="rounded-xl border border-border bg-background px-3 py-2"
/>


       <input
  value={maxPrice}
  onChange={(e) => setMaxPrice(e.target.value)}
  placeholder="Max price"
  type="number"
  min="0"
  step="1"
  className="rounded-xl border border-border bg-background px-3 py-2"
/>


      </div>



      <label className="mt-4 flex items-center gap-2 text-sm">


        <input

          type="checkbox"

          checked={featured}

          onChange={(e)=>
            setFeatured(e.target.checked)
          }

        />


        Featured listings only


      </label>




      <div className="mt-5 flex flex-wrap gap-2">
  <button
    type="button"
    onClick={applyFilters}
    className="rounded-xl bg-branch-500 px-5 py-2 text-sm font-medium text-white hover:bg-branch-600"
  >
    Apply filters
  </button>

  <button
    type="button"
    onClick={clearFilters}
    className="rounded-xl border border-border bg-background px-5 py-2 text-sm font-medium hover:bg-muted"
  >
    Clear filters
  </button>
</div>


    </div>

  );

}