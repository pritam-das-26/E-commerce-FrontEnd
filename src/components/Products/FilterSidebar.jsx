import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const FilterSidebar = () => {
  const [searchParams, setSearchParams] = useSearchParams(); //it reads the current query parameter in the URL
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    category: "",
    gender: "",
    color: "",
    size: [],
    material: [],
    brand: [],
    minPrice: 0,
    maxPrice: 100,
  });
  const [priceRange, setPriceRange] = useState([0, 100]);

   const resetFilters = () => {
    setFilters({
      category: "",
      gender: "",
      color: "",
      size: [],
      material: [],
      brand: [],
      minPrice: 0,
      maxPrice: 100,
      search: "",
    });
    setPriceRange([0, 100]);
    setSearchParams({}); // clear URL
    navigate(window.location.pathname); // reload base route without query
  };

  const categories = ["Top Wear", "Bottom Wear"];
  const genders = ["Men", "Women"];
  const colors = [
    "Blue",
    "Black",
    "Green",
    "Gray",
    "White",
    "Pink",
  ];

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const materials = [
    "Cotton",
    "Wool",
    "Denim",
    "Polyester",
    "Silk",
    "Viscose",
    "Fleece",
  ];

  const brands = [
    "Urban Threads",
    "Modern Fit",
    "Street Style",
    "Beach Breeze",
    "Fashionista",
    "ChicStyle",
  ];

  useEffect(() => {
    const params = Object.fromEntries([...searchParams]);

    setFilters({
      category: params.category || "",
      gender: params.gender || "",
      color: params.color || "",
      size: params.size ? params.size.split(",") : [],
      material: params.material ? params.material.split(",") : [],
      brand: params.brand ? params.brand.split(",") : [],
      minPrice: params.minPrice || 0,
      maxPrice: params.maxPrice || 100,
    });
    setPriceRange([0, params.maxPrice || 100]);
  }, [searchParams]);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newFilters = { ...filters };
    console.log(name, "name");

    if (type === "checkbox") {
      if (checked) {
        newFilters[name] = [...(newFilters[name] || []), value]; // ["XS", "S"] will append to the array and add a new value
      } else {
        newFilters[name] = newFilters[name].filter((item) => item !== value); // if unchecked, remove the value from the array
      }
    } else {
      newFilters[name] = value;
    }
    console.log(newFilters, "filters");
    setFilters(newFilters);
    updateURLParams(newFilters);
  };

  const updateURLParams = (newFilters) => {
    const params = new URLSearchParams();
    Object.keys(newFilters).forEach((key) => {
      if (Array.isArray(newFilters[key]) && newFilters[key].length > 0) {
        params.append(key, newFilters[key].join(",")); // "XS, S"
      } else if (newFilters[key]) {
        params.append(key, newFilters[key]);
      }
    });
    setSearchParams(params); //update the url with these parameters from params
    navigate(`?${params.toString()}`); // ?category=Bottom+Wear&size=
  };

  return (
    <div className="p-4">
      <h3 className="mb-4 text-xl font-medium text-gray-800">Filter</h3>

      {/* 🔹 Reset Button */}
      <button
        onClick={resetFilters}
        className="mt-4 w-full px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
      >
        Reset Filters
      </button>
      
      {/* Search Filter */}

      <input
      style={{ marginTop: "8px" }}
        type="text"
        name="search"
        value={filters.search || ""}
        onChange={(e) => {
          setFilters({ ...filters, search: e.target.value }); // just local state
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            updateURLParams({ ...filters, search: e.target.value }); // update only on enter
          }
        }}
        placeholder="Search products..."
        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      {/* Category Filter */}
      <div className="mt-2">
        <label>Category</label>
        {categories.map((category) => (
          <div key={category}>
            <input
              type="radio"
              name="category"
              value={category}
              onChange={handleFilterChange}
              checked={filters.category === category}
              className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-400"
            />{" "}
            <span className="text-gray-700">{category}</span>
          </div>
        ))}
      </div>

      {/* Gender Filter */}
      <div className="mb-6" style={{ marginTop: "8px" }}>
        <label>Gender</label>
        {genders.map((gender) => (
          <div key={gender}>
            <input
              type="radio"
              name="gender"
              value={gender}
              onChange={handleFilterChange}
              checked={filters.gender === gender}
              className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-400"
            />{" "}
            <span className="text-gray-700">{gender}</span>
          </div>
        ))}
      </div>

      {/* Color Filter */}
      <div className="mb-6">
        <label className="block mb-2 font-medium text-gray-600">Color</label>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color}
              name="color"
              value={color}
              onClick={handleFilterChange}
              className="w-8 h-8 transition border border-gray-300 rounded-full hover:scale-105 "
              style={{ backgroundColor: color.toLowerCase() }}
            ></button>
          ))}
        </div>
      </div>

      {/* Size Filter */}
      <div className="mb-6">
        <label className="block mb-2 font-medium text-gray-600">Size</label>

        {sizes.map((size) => (
          <div key={size} className="flex items-center mb-1">
            <input
              type="checkbox"
              name="size"
              value={size}
              onChange={handleFilterChange}
              checked={filters.size.includes(size)}
              className="w-4 h-4 mr-2 text-blue-500 border-gray-300 focus:ring-blue-400"
            />
            <span className="text-gray-700">{size}</span>
          </div>
        ))}
      </div>

      {/* Material Filter */}
      <div className="mb-6">
        <label className="block mb-2 font-medium text-gray-600">Material</label>

        {materials.map((material) => (
          <div key={material} className="flex items-center mb-1">
            <input
              type="checkbox"
              name="material"
              value={material}
              onChange={handleFilterChange}
              checked={filters.material.includes(material)}
              className="w-4 h-4 mr-2 text-blue-500 border-gray-300 focus:ring-blue-400"
            />
            <span className="text-gray-700">{material}</span>
          </div>
        ))}
      </div>

      {/* Brand Filter */}
      <div className="mb-6">
        <label className="block mb-2 font-medium text-gray-600">Brand</label>

        {brands.map((brand) => (
          <div key={brand} className="flex items-center mb-1">
            <input
              type="checkbox"
              name="brand"
              value={brand}
              onChange={handleFilterChange}
              checked={filters.brand.includes(brand)}
              className="w-4 h-4 mr-2 text-blue-500 border-gray-300 focus:ring-blue-400"
            />
            <span className="text-gray-700">{brand}</span>
          </div>
        ))}
      </div>

      {/* Price Range Filter */}
      {/* Price Range Filter */}
      <div>
        <label className="block mb-2 font-medium text-gray-600">
          Price Range
        </label>
        <input
          type="range"
          name="maxPrice"
          min={0}
          max={100}
          value={filters.maxPrice}
          onChange={(e) => {
            const newFilters = {
              ...filters,
              minPrice: 0,
              maxPrice: Number(e.target.value),
            };
            setFilters(newFilters);
            setPriceRange([0, Number(e.target.value)]);
            updateURLParams(newFilters); // push to URL so API refetches
          }}
          className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between mt-2 text-gray-600">
          <span>${filters.minPrice}</span>
          <span>${filters.maxPrice}</span>
        </div>
      </div>




    </div>
  );
};

export default FilterSidebar;
