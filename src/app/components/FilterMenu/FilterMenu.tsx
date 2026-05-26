"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Checkbox, FormControlLabel, Chip, Button } from "@mui/material";

interface FilterTag {
  id: string;
  label: string;
  type: "category" | "discount";
  value: string;
}

interface CategoryOption {
  _id: string;
  name: string;
  status?: string;
}

interface FilterMenuProps {
  onFilterChange?: (filters: any) => void;
}

const STATIC_DISCOUNT_OPTIONS = [
  { id: "30", label: "30% or more" },
  { id: "40", label: "40% or more" },
  { id: "50", label: "50% or more" },
  { id: "60", label: "60% or more" },
  { id: "70", label: "70% or more" },
  { id: "80", label: "80% or more" },
] as const;

const FilterMenu: React.FC<FilterMenuProps> = ({ onFilterChange }) => {
  const [selectedFilters, setSelectedFilters] = useState<FilterTag[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      setLoadingCategories(true);
      setCategoryError(null);

      try {
        const response = await fetch("/api/category");
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to fetch categories");
        }

        if (isMounted) {
          setCategories(data.categories || []);
        }
      } catch (error) {
        if (isMounted) {
          setCategoryError(error instanceof Error ? error.message : "Failed to fetch categories");
          setCategories([]);
        }
      } finally {
        if (isMounted) {
          setLoadingCategories(false);
        }
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        categories: selectedCategories,
        minDiscount:
          selectedDiscounts.length > 0
            ? Math.max(...selectedDiscounts.map((discount) => parseInt(discount, 10)))
            : null,
      });
    }
  }, [selectedCategories, selectedDiscounts, onFilterChange]);

  const removeFilter = (filterId: string) => {
    const filter = selectedFilters.find((item) => item.id === filterId);

    setSelectedFilters((prev) => prev.filter((item) => item.id !== filterId));

    if (filter?.type === "category") {
      setSelectedCategories((prev) => prev.filter((value) => value !== filter.value));
    } else if (filter?.type === "discount") {
      setSelectedDiscounts((prev) => prev.filter((value) => value !== filter.value));
    }
  };

  const handleCategoryChange = (category: CategoryOption) => {
    const isSelected = selectedCategories.includes(category.name);

    if (isSelected) {
      setSelectedCategories((prev) => prev.filter((value) => value !== category.name));
      setSelectedFilters((prev) => prev.filter((item) => item.id !== `category-${category._id}`));
      return;
    }

    setSelectedCategories((prev) => [...prev, category.name]);
    setSelectedFilters((prev) => [
      ...prev,
      {
        id: `category-${category._id}`,
        label: category.name,
        type: "category",
        value: category.name,
      },
    ]);
  };

  const handleDiscountChange = (discountId: string) => {
    const isSelected = selectedDiscounts.includes(discountId);
    const discount = STATIC_DISCOUNT_OPTIONS.find((item) => item.id === discountId);

    if (isSelected) {
      setSelectedDiscounts((prev) => prev.filter((value) => value !== discountId));
      setSelectedFilters((prev) => prev.filter((item) => item.id !== `discount-${discountId}`));
      return;
    }

    setSelectedDiscounts((prev) => [...prev, discountId]);

    if (discount) {
      setSelectedFilters((prev) => [
        ...prev,
        {
          id: `discount-${discountId}`,
          label: discount.label,
          type: "discount",
          value: discountId,
        },
      ]);
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

        <div className="mb-4">
          <h6
            className="fw-bold mb-2"
            style={{ color: "#1a7c3f", fontSize: "13px", letterSpacing: "0.5px" }}
          >
            CATEGORIES
          </h6>

          {loadingCategories && <div className="text-muted small">Loading categories...</div>}

          {!loadingCategories && categoryError && (
            <div className="text-danger small">{categoryError}</div>
          )}

          {!loadingCategories && !categoryError && categories.length === 0 && (
            <div className="text-muted small">No categories available</div>
          )}

          {!loadingCategories && !categoryError && categories.length > 0 &&
            categories.map((category) => (
              <FormControlLabel
                key={category._id}
                control={
                  <Checkbox
                    checked={selectedCategories.includes(category.name)}
                    onChange={() => handleCategoryChange(category)}
                    size="small"
                  />
                }
                label={category.name}
                sx={{
                  display: "block",
                  fontSize: "14px",
                  color: "#6c757d",
                  marginBottom: "4px",
                }}
              />
            ))}
        </div>

        <div>
          <h6
            className="fw-bold mb-2"
            style={{ color: "#1a7c3f", fontSize: "13px", letterSpacing: "0.5px" }}
          >
            DISCOUNTS
          </h6>
          {STATIC_DISCOUNT_OPTIONS.map((discount) => (
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