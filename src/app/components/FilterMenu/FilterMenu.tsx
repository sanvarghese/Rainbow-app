"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Checkbox, FormControlLabel, Chip, Button } from "@mui/material";

interface FilterTag {
  id: string;
  label: string;
  type: "category" | "discount";
}

interface FilterMenuProps {
  onFilterChange?: (filters: any) => void;
}

const FilterMenu: React.FC<FilterMenuProps> = ({ onFilterChange }) => {
  const [selectedFilters, setSelectedFilters] = useState<FilterTag[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>([]);

  const categories = [
    { id: "food", label: "Food" },
    { id: "powder", label: "Powder" },
    { id: "paste", label: "Paste" },
    { id: "accessories", label: "Accessories" },
  ];

  const discounts = [
    { id: "30", label: "30% or more" },
    { id: "40", label: "40% or more" },
    { id: "50", label: "50% or more" },
    { id: "60", label: "60% or more" },
    { id: "70", label: "70% or more" },
    { id: "80", label: "80% or more" },
  ];

  // Notify parent component when filters change
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        categories: selectedCategories,
        minDiscount: selectedDiscounts.length > 0 
          ? Math.max(...selectedDiscounts.map(d => parseInt(d))) // Use MAX instead of MIN
          : null,
      });
    }
  }, [selectedCategories, selectedDiscounts, onFilterChange]);

  const removeFilter = (filterId: string) => {
    setSelectedFilters((prev) => prev.filter((f) => f.id !== filterId));
    const filter = selectedFilters.find((f) => f.id === filterId);
    if (filter?.type === "category") {
      setSelectedCategories((prev) =>
        prev.filter((id) => `category-${id}` !== filterId)
      );
    } else if (filter?.type === "discount") {
      setSelectedDiscounts((prev) =>
        prev.filter((id) => `discount-${id}` !== filterId)
      );
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    const isSelected = selectedCategories.includes(categoryId);
    const category = categories.find((c) => c.id === categoryId);

    if (isSelected) {
      setSelectedCategories((prev) => prev.filter((id) => id !== categoryId));
      setSelectedFilters((prev) =>
        prev.filter((f) => f.id !== `category-${categoryId}`)
      );
    } else {
      setSelectedCategories((prev) => [...prev, categoryId]);
      if (category) {
        setSelectedFilters((prev) => [
          ...prev,
          { id: `category-${categoryId}`, label: category.label, type: "category" },
        ]);
      }
    }
  };

  const handleDiscountChange = (discountId: string) => {
    const isSelected = selectedDiscounts.includes(discountId);
    const discount = discounts.find((d) => d.id === discountId);

    if (isSelected) {
      setSelectedDiscounts((prev) => prev.filter((id) => id !== discountId));
      setSelectedFilters((prev) =>
        prev.filter((f) => f.id !== `discount-${discountId}`)
      );
    } else {
      setSelectedDiscounts((prev) => [...prev, discountId]);
      if (discount) {
        setSelectedFilters((prev) => [
          ...prev,
          { id: `discount-${discountId}`, label: discount.label, type: "discount" },
        ]);
      }
    }
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedDiscounts([]);
    setSelectedFilters([]);
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-3">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold mb-0">Filters</h6>
          {selectedFilters.length > 0 && (
            <Button
              size="small"
              onClick={clearAllFilters}
              sx={{ textTransform: "none", fontSize: "12px" }}
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Selected Filters */}
        {selectedFilters.length > 0 && (
          <div className="mb-3 d-flex flex-wrap">
            {selectedFilters.map((filter) => (
              <Chip
                key={filter.id}
                label={filter.label}
                onDelete={() => removeFilter(filter.id)}
                deleteIcon={<X size={14} />}
                sx={{
                  margin: "4px",
                  fontSize: "12px",
                  borderRadius: "6px",
                  backgroundColor: "#f8f9fa",
                  border: "1px solid #dee2e6",
                }}
              />
            ))}
          </div>
        )}

        {/* Categories Section */}
        <div className="mb-4">
          <h6
            className="fw-bold mb-2"
            style={{ color: "#1a7c3f", fontSize: "13px", letterSpacing: "0.5px" }}
          >
            CATEGORIES
          </h6>
          {categories.map((category) => (
            <FormControlLabel
              key={category.id}
              control={
                <Checkbox
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => handleCategoryChange(category.id)}
                  size="small"
                />
              }
              label={category.label}
              sx={{
                display: "block",
                fontSize: "14px",
                color: "#6c757d",
                marginBottom: "4px",
              }}
            />
          ))}
        </div>

        {/* Discounts Section */}
        <div>
          <h6
            className="fw-bold mb-2"
            style={{ color: "#1a7c3f", fontSize: "13px", letterSpacing: "0.5px" }}
          >
            DISCOUNTS
          </h6>
          {discounts.map((discount) => (
            <FormControlLabel
              key={discount.id}
              control={
                <Checkbox
                  checked={selectedDiscounts.includes(discount.id)}
                  onChange={() => handleDiscountChange(discount.id)}
                  size="small"
                />
              }
              label={discount.label}
              sx={{
                display: "block",
                fontSize: "14px",
                color: "#6c757d",
                marginBottom: "4px",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterMenu;