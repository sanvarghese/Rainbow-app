"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { Checkbox, FormControlLabel, Chip, Button } from "@mui/material";

interface FilterTag {
  id: string;
  label: string;
  type: "category" | "discount";
}

const FilterMenu: React.FC = () => {
  const [selectedFilters, setSelectedFilters] = useState<FilterTag[]>([
    { id: "discount-30-or-more", label: "30% or more", type: "discount" },
    { id: "category-dry-fruits", label: "Dry Fruits", type: "category" },
  ]);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "dry-fruits",
  ]);
  const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>([
    "30-or-more",
  ]);

  const categories = [
    { id: "curry-powder", label: "Curry powder" },
    { id: "honey", label: "Honey" },
    { id: "dry-fruits", label: "Dry Fruits" },
    { id: "snacks", label: "Snacks" },
    { id: "breakfast-items", label: "Breakfast Items" },
  ];

  const discounts = [
    { id: "30-or-more", label: "30% or more" },
    { id: "40-or-more", label: "40% or more" },
    { id: "50-or-more", label: "50% or more" },
    { id: "60-or-more", label: "60% or more" },
    { id: "70-or-more", label: "70% or more" },
    { id: "80-or-more", label: "80% or more" },
  ];

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

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-3">
        {/* Header Buttons */}
        <div className="d-flex mb-3">
          <Button
            variant="outlined"
            className="flex-fill me-2"
            sx={{
              backgroundColor: "#e9ecef",
              color: "#495057",
              fontWeight: 500,
              borderRadius: "8px",
              textTransform: "none",
            }}
          >
            Filters
          </Button>
          <Button
            variant="outlined"
            className="flex-fill ms-2"
            sx={{
              backgroundColor: "#e9ecef",
              color: "#495057",
              fontWeight: 500,
              borderRadius: "8px",
              textTransform: "none",
            }}
          >
            Categories
          </Button>
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
            style={{ color: "#28a745", fontSize: "13px", letterSpacing: "0.5px" }}
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
            style={{ color: "#28a745", fontSize: "13px", letterSpacing: "0.5px" }}
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
