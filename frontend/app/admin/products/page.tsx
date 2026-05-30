"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Cookies from "js-cookie";
import api from "@/services/api";
import StarterKit from "@tiptap/starter-kit";
import { useEditor, EditorContent } from "@tiptap/react";
import {
  Package,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Layers,
  AlertCircle,
  GripVertical
} from "lucide-react";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  stock: number;
  is_active: boolean;
  category_id: number;
  thumbnail: string;
  description?: string;

  images?: {
    id: number;
    image: string;
    is_primary?: boolean;
  }[];

  category?: {
    name: string;
  };
}

function SortableGalleryItem({
  image,
  children,
}: {
  image: {
    id: number;
    image: string;
  };
  children: (
    dragHandleProps: any
  ) => React.ReactNode;
}) {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: image.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
    >
      {children({
        ...attributes,
        ...listeners,
      })}
    </div>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedDeleteProduct, setSelectedDeleteProduct] = useState<Product | null>(null);
  const [primaryLoadingId, setPrimaryLoadingId] = useState<number | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const BASE_URL =process.env.NEXT_PUBLIC_STORAGE_URL || "http://127.0.0.1:8000";

  const [form, setForm] = useState({
    category_id: "",
    name: "",
    description: "",
    price: "",
    stock: "",
    is_active: true,
  });

  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryPreview, setGalleryPreview] = useState<string[]>([]);
  const [existingGallery, setExistingGallery] = useState<
  {
    id: number;
    image: string;
    is_primary?: boolean;
  }[]
  >([]);
  const [galleryOrder, setGalleryOrder] = useState<number[]>([]);
  const [deletedGalleryIds, setDeletedGalleryIds] = useState<number[]>([]);
  const [replaceGallery, setReplaceGallery] = useState<{
    [key: number]: File;
  }>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

    const sensors = useSensors(
      useSensor(PointerSensor)
    );

  const fetchProducts = useCallback(async (page = 1) => {
    try {
      setLoading(true);

      const token = Cookies.get("token");

      if (!token) {
        alert("Session login habis");
        return;
      }

      const response = await api.get(`/admin/products?page=${page}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProducts(response.data.data || []);
      setCurrentPage(response.data.current_page || 1);
      setLastPage(response.data.last_page || 1);

    } catch (error: any) {

      console.error(error);

      if (error?.response?.status === 401) {
        alert("Unauthorized, silahkan login ulang");
      } else {
        alert("Gagal mengambil products");
      }

    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {

      const response = await api.get("/categories");

      setCategories(response.data);

    } catch (error) {

      console.error(error);

      alert("Gagal mengambil categories");

    }
  }, []);

  async function handleToggleStatus(product: Product) {
    try {
      const token = Cookies.get("token");
      await api.put(
        `/admin/products/${product.id}`,
        {
          category_id: product.category_id,
          name: product.name,
          description: product.description || "",
          price: product.price,
          stock: product.stock,
          is_active: !product.is_active,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await fetchProducts(currentPage);
    } catch (error) {
      console.error(error);
      alert("Gagal update status");
    }
  }
  
  async function handleDeleteProduct() {
    if (!selectedDeleteProduct) return;
    try {
      setDeleteLoading(true);
      const token = Cookies.get("token");
      await api.delete(`/admin/products/${selectedDeleteProduct.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchProducts(currentPage);
      setSelectedDeleteProduct(null);
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus product");
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault();

    if (loadingCreate || loadingUpdate) return;

    try {

      if (!thumbnail) {
        alert("Thumbnail wajib diisi");
        return;
      }

      setLoadingCreate(true);

      const token = Cookies.get("token");

      const formData = new FormData();

      formData.append("category_id", form.category_id);
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("stock", form.stock);
      formData.append("is_active", form.is_active ? "1" : "0");

      formData.append("thumbnail", thumbnail);

      galleryImages.forEach((image) => {
        formData.append("images[]", image);
      });

      deletedGalleryIds.forEach((id) => {
        formData.append("deleted_gallery[]", String(id));
      });

      Object.entries(replaceGallery).forEach(([imageId, file]) => {
        formData.append(`replace_gallery[${imageId}]`, file);
      });

      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await api.post(
        "/admin/products",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response.data);

      await fetchProducts(currentPage);

      closeAndResetModal();

      alert("Product berhasil dibuat");

    } catch (error: any) {

      console.error("CREATE PRODUCT ERROR:", error);

      if (error.response) {

        console.log(error.response.data);

        alert(
          error.response.data.message ||
          JSON.stringify(error.response.data.errors)
        );

      } else {

        alert("Terjadi error saat create product");

      }

    } finally {

      setLoadingCreate(false);

    }
  }

  function handleEditProduct(product: Product) {

    setEditId(product.id);

    setPreviewImage(
      `${BASE_URL}/storage/${product.thumbnail}`
    );

    if (product.images) {

      setExistingGallery(product.images);

      setGalleryOrder(
        product.images.map((img) => img.id)
      );
    }

    setForm({
      category_id: String(product.category_id),
      name: product.name || "",
      description: product.description || "",
      price: String(product.price),
      stock: String(product.stock),
      is_active: product.is_active,
    });

    setShowModal(true);
  }

  async function handleUpdateProduct(e: React.FormEvent) {
    e.preventDefault();

    if (loadingCreate || loadingUpdate) return;

    try {
      setLoadingUpdate(true);

      const token = Cookies.get("token");

      const formData = new FormData();

      formData.append("_method", "PUT");
      formData.append("category_id", form.category_id);
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("stock", form.stock);
      formData.append("is_active", form.is_active ? "1" : "0");

      if (thumbnail) {
        formData.append("thumbnail", thumbnail);
      }

      galleryImages.forEach((image) => {
        formData.append("images[]", image);
      });

      deletedGalleryIds.forEach((id) => {
        formData.append("deleted_gallery[]", String(id));
      });

      galleryOrder.forEach((id, index) => {
        formData.append(
          `gallery_order[${id}]`,
          String(index + 1)
        );
      });

      // TAMBAHKAN INI
      Object.entries(replaceGallery).forEach(([imageId, file]) => {
        formData.append(`replace_gallery[${imageId}]`, file);
      });

      // for (let pair of formData.entries()) {
      //   console.log(pair[0], pair[1]);
      // }

      const response = await api.post(
        `/admin/products/${editId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setProducts((prev) =>
        prev.map((product) =>
          product.id === editId
            ? response.data.product
            : product
        )
      );

      closeAndResetModal();

    } catch (error) {

      console.error(error);

      alert("Gagal update product");

    } finally {

      setLoadingUpdate(false);

    }
  }

  function closeAndResetModal() {

    setShowModal(false);

    setEditId(null);

    setThumbnail(null);

    setPreviewImage(null);

    setGalleryImages([]);

    setGalleryPreview([]);

    setExistingGallery([]);

    setGalleryOrder([])

    setDeletedGalleryIds([]);

    setReplaceGallery({});



    editor?.commands.setContent("", {
      emitUpdate: false,
    });

    setForm({
      category_id: "",
      name: "",
      description: "",
      price: "",
      stock: "",
      is_active: true,
    });
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];

    if (!file) return;

    handleThumbnailFile(file);
  }

  function handleThumbnailFile(file: File) {
    if (!file.type.startsWith("image/")) {
      alert("File harus gambar");
      return;
    }

    if (previewImage?.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage);
    }

    setThumbnail(file);
    setPreviewImage(URL.createObjectURL(file));
  }

  function handleGalleryFiles(files: File[]) {
    const imageFiles = files.filter((file) =>
      file.type.startsWith("image/")
    );

    if (!imageFiles.length) return;

    galleryPreview.forEach((url) => {
      if (url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    });

    setGalleryImages(imageFiles);

    const previews = imageFiles.map((file) =>
      URL.createObjectURL(file)
    );

    setGalleryPreview(previews);
  }

  function handleRemoveExistingGallery(id: number) {
    setDeletedGalleryIds((prev) => [...prev, id]);

    setExistingGallery((prev) =>
      prev.filter((img) => img.id !== id)
    );
  }

  async function handleSetPrimaryImage(imageId: number) {

    if (primaryLoadingId === imageId) return;

    try {

      setPrimaryLoadingId(imageId);

      // =========================
      // OPTIMISTIC UI
      // =========================

      setExistingGallery((prev) => {

        const updated = prev.map((img) => ({
          ...img,
          is_primary: img.id === imageId,
        }));

        const selected = updated.find(
          (img) => img.id === imageId
        );

        if (selected) {
          setPreviewImage(
            `${BASE_URL}/storage/${selected.image}`
          );
        }

        return updated;
      });

      // =========================
      // BACKGROUND API
      // =========================

      const token = Cookies.get("token");

      await api.post(
        `/admin/products/${editId}/gallery/${imageId}/primary`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

    } catch (error) {

      console.error(error);

      alert("Gagal set primary image");

      // OPTIONAL:
      // fetch ulang kalau gagal
      await fetchProducts(currentPage);

    } finally {

      setPrimaryLoadingId(null);

    }
  }

  async function saveGalleryOrder(orderIds: number[]) {

    if (!editId) return;

    try {

      setSavingOrder(true);

      const token = Cookies.get("token");

      const payload: Record<number, number> = {};

      orderIds.forEach((id, index) => {
        payload[id] = index + 1;
      });

      await api.post(
        `/admin/products/${editId}/gallery/reorder`,
        {
          gallery_order: payload,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

    } catch (error) {

      console.error(error);

      alert("Gagal save gallery order");

    } finally {

      setSavingOrder(false);

    }
  }

  async function handleDragEnd(event: any) {

    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = existingGallery.findIndex(
      (item) => item.id === active.id
    );

    const newIndex = existingGallery.findIndex(
      (item) => item.id === over.id
    );

    const reordered = arrayMove(
      existingGallery,
      oldIndex,
      newIndex
    );

    // =========================
    // OPTIMISTIC UI
    // =========================

    setExistingGallery(reordered);

    const latestOrder = reordered.map(
      (item) => item.id
    );

    setGalleryOrder(latestOrder);

    // =========================
    // AUTO SAVE
    // =========================

    await saveGalleryOrder(latestOrder);
  }

  const editor = useEditor({
  immediatelyRender: false,
    extensions: [StarterKit],
    content: form.description,
    editorProps: {
      attributes: {
        class: "outline-none min-h-[120px] sm:min-h-[150px] max-h-[220px] overflow-y-auto p-4 prose prose-sm max-w-none focus:outline-none",
      },
    },
    onUpdate({ editor }) {
      setForm((prev) => ({
        ...prev,
        description: editor.getHTML(),
      }));
    },
  });

  useEffect(() => {
    if (!editor) return;

    const current = editor.getHTML();

    if (form.description !== current) {
      editor.commands.setContent(form.description || "", {
        emitUpdate: false,
      });
    }
  }, [editor, form.description]);

  useEffect(() => {
    return () => {
      if (previewImage?.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }

      galleryPreview.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];

    return products.filter((product) =>
      (product.name || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [products, search]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-zinc-50/50 p-4">
        <div className="w-8 h-8 border-4 border-[#007FFF] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-500 font-medium tracking-wide text-sm text-center">
          Loading products...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto bg-zinc-50/30 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-zinc-200/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#007FFF] animate-pulse"></span>
            <p className="text-xs font-bold uppercase tracking-widest text-[#007FFF]">
              Admin Panel
            </p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight mt-1">
            Product Management
          </h1>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto h-12 px-6 rounded-2xl bg-[#007FFF] text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#007FFF]/20 hover:bg-[#0066CC] active:scale-[0.98] transition-all duration-200"
        >
          <Plus size={18} className="stroke-[3]" />
          <span>{editId ? "Edit Product" : "Add Product"}</span>
        </button>
      </div>

      {/* SEARCH */}
      <div className="relative w-full sm:max-w-md mb-8 group">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#007FFF] transition-colors"
        />
        <input
          type="text"
          placeholder="Cari product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-12 pl-11 pr-4 rounded-2xl border border-zinc-200 bg-white outline-none focus:ring-4 focus:ring-[#007FFF]/10 focus:border-[#007FFF] transition-all duration-200 shadow-sm shadow-zinc-100"
        />
      </div>

      {/* DESKTOP TABLE VIEW */}
      <div className="hidden md:block bg-white rounded-3xl border border-zinc-200/80 overflow-hidden shadow-sm shadow-zinc-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-50/70 border-b border-zinc-200 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">
                <th className="px-6 py-4.5">Product</th>
                <th className="px-6 py-4.5">Category</th>
                <th className="px-6 py-4.5">Price</th>
                <th className="px-6 py-4.5">Stock</th>
                <th className="px-6 py-4.5 text-center">Status</th>
                <th className="px-6 py-4.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package size={32} className="text-zinc-300" />

                      <p className="font-semibold text-zinc-600">
                        Product tidak ditemukan
                      </p>

                      <p className="text-sm text-zinc-400">
                        Coba gunakan keyword lain
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-zinc-50/50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-4">
                        <div className="relative group/img overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 w-14 h-14 flex-shrink-0">
                          <img
                            src={`${BASE_URL}/storage/${product.thumbnail}`}
                            alt={product.name}
                            className="w-full h-full object-cover transition duration-300 group-hover/img:scale-105"
                          />
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-bold text-zinc-900 truncate max-w-[200px]">
                            {product.name}
                          </h3>

                          <p className="text-xs text-zinc-400 font-mono tracking-tight truncate max-w-[200px] mt-0.5">
                            {product.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-1.5 text-zinc-700 font-medium">
                        <Layers size={14} className="text-zinc-400" />
                        <span>
                          {product.category?.name || "Uncategorized"}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4.5 font-bold text-zinc-900 text-base">
                      <span className="text-xs font-semibold text-[#007FFF] mr-0.5">
                        Rp
                      </span>

                      {Number(product.price).toLocaleString("id-ID")}
                    </td>

                    <td className="px-6 py-4.5 font-medium text-zinc-600">
                      {product.stock}{" "}
                      <span className="text-xs text-zinc-400 font-normal">
                        pcs
                      </span>
                    </td>

                    <td className="px-6 py-4.5 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleToggleStatus(product)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                            product.is_active
                              ? "bg-emerald-500"
                              : "bg-zinc-300"
                          }`}
                          role="switch"
                          aria-checked={product.is_active}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              product.is_active
                                ? "translate-x-5"
                                : "translate-x-0"
                            }`}
                          />
                        </button>

                        <span
                          className={`text-xs font-bold w-14 text-left ${
                            product.is_active
                              ? "text-emerald-600"
                              : "text-zinc-400"
                          }`}
                        >
                          {product.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4.5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="w-9 h-9 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-600 flex items-center justify-center hover:text-[#007FFF] hover:bg-blue-50 hover:border-blue-200 active:scale-95 transition-all duration-150"
                          title="Edit Product"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          onClick={() =>
                            setSelectedDeleteProduct(product)
                          }
                          className="w-9 h-9 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-600 flex items-center justify-center hover:text-red-600 hover:bg-red-50 hover:border-red-200 active:scale-95 transition-all duration-150"
                          title="Delete Product"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE CARD LIST VIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-3xl border border-zinc-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-start gap-4">
              <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 w-16 h-16 flex-shrink-0">
                <img
                  loading="lazy"
                  src={`${BASE_URL}/storage/${product.thumbnail}`}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-medium mb-0.5">
                  <Layers size={12} />
                  <span>{product.category?.name || "Uncategorized"}</span>
                </div>
                <h3 className="font-bold text-zinc-900 text-base leading-tight break-words">
                  {product.name}
                </h3>
                <p className="text-xs text-zinc-400 font-mono tracking-tight mt-1 truncate">
                  {product.slug}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
              <div>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Price</p>
                <p className="font-black text-zinc-900 text-base mt-0.5">
                  <span className="text-xs font-bold text-[#007FFF] mr-0.5">Rp</span>
                  {Number(product.price).toLocaleString("id-ID")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Stock</p>
                <p className="font-bold text-zinc-700 text-sm mt-0.5">
                  {product.stock} <span className="text-xs text-zinc-400 font-normal">pcs</span>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-100 bg-zinc-50/50 -mx-5 -mb-5 px-5 py-4 rounded-b-3xl">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => handleToggleStatus(product)}
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                    product.is_active ? "bg-emerald-500" : "bg-zinc-300"
                  }`}
                  role="switch"
                  aria-checked={product.is_active}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      product.is_active ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
                <span className={`text-xs font-bold ${product.is_active ? "text-emerald-600" : "text-zinc-400"}`}>
                  {product.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditProduct(product)}
                  className="w-9 h-9 rounded-xl border border-zinc-200 bg-white text-zinc-600 flex items-center justify-center hover:text-[#007FFF] hover:bg-blue-50 active:scale-95 transition-all"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => setSelectedDeleteProduct(product)}
                  className="w-9 h-9 rounded-xl border border-zinc-200 bg-white text-zinc-600 flex items-center justify-center hover:text-red-600 hover:bg-red-50 active:scale-95 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      {lastPage > 1 && (
        <div className="flex items-center justify-center gap-2 sm:gap-3 mt-8">
          <button
            onClick={() => fetchProducts(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-10 sm:h-11 px-4 sm:px-5 rounded-2xl border border-zinc-200 bg-white text-zinc-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 active:scale-95 transition-all text-xs sm:text-sm"
          >
            Previous
          </button>
          <div className="px-4 sm:px-5 h-10 sm:h-11 rounded-2xl bg-[#007FFF] text-white flex items-center font-bold text-xs sm:text-sm shadow-sm">
            {currentPage} / {lastPage}
          </div>
          <button
            onClick={() => fetchProducts(currentPage + 1)}
            disabled={currentPage === lastPage}
            className="h-10 sm:h-11 px-4 sm:px-5 rounded-2xl border border-zinc-200 bg-white text-zinc-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 active:scale-95 transition-all text-xs sm:text-sm"
          >
            Next
          </button>
        </div>
      )}

      {/* EMPTY STATE */}
      {!filteredProducts.length && (
        <div className="bg-white rounded-3xl border border-zinc-200 p-8 sm:p-16 text-center mt-6 shadow-sm shadow-zinc-100">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-zinc-50 border border-zinc-100 flex items-center justify-center mb-5 text-zinc-400">
            <Package size={32} className="stroke-[1.5]" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-zinc-900">Product tidak ditemukan</h3>
          <p className="text-zinc-500 mt-2 max-w-xs mx-auto text-xs sm:text-sm">
            Coba gunakan keyword pencarian lain atau tambahkan produk baru.
          </p>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[999] bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-zinc-100 overflow-hidden flex flex-col max-h-[90vh]">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-zinc-100 bg-zinc-50/50">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#007FFF] font-black">
                  Product Form
                </p>
                <h2 className="text-xl sm:text-2xl font-black text-zinc-900 mt-0.5">
                  {editId ? "Edit Product Details" : "Create New Product"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeAndResetModal}
                className="w-9 h-9 rounded-xl border border-zinc-200 bg-white text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 flex items-center justify-center transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* MODAL FORM */}
            <form
              onSubmit={editId ? handleUpdateProduct : handleCreateProduct}
              className="p-5 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto"
            >
              <div>
                <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-2 w-full h-12 px-4 rounded-xl border border-zinc-200 outline-none focus:ring-4 focus:ring-[#007FFF]/10 focus:border-[#007FFF] transition-all"
                  placeholder="Masukkan nama produk"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className="mt-2 w-full h-12 px-4 rounded-xl border border-zinc-200 bg-white outline-none focus:ring-4 focus:ring-[#007FFF]/10 focus:border-[#007FFF] transition-all cursor-pointer"
                    required
                  >
                    <option value="">Choose Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                    Status Aktif
                  </label>
                  <select
                    value={String(form.is_active)}
                    onChange={(e) => setForm({ ...form, is_active: e.target.value === "true" })}
                    className="mt-2 w-full h-12 px-4 rounded-xl border border-zinc-200 bg-white outline-none focus:ring-4 focus:ring-[#007FFF]/10 focus:border-[#007FFF] transition-all cursor-pointer"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                  Description
                </label>
                <div className="mt-2 border border-zinc-200 rounded-2xl overflow-hidden focus-within:ring-4 focus-within:ring-[#007FFF]/10 focus-within:border-[#007FFF] transition-all bg-white">
                  {/* TOOLBAR RICH TEXT */}
                  <div className="flex flex-wrap items-center gap-1.5 p-2 border-b border-zinc-100 bg-zinc-50/70">
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleBold().run()}
                      className={`h-8 w-8 rounded-lg text-sm font-bold flex items-center justify-center transition-colors ${
                        editor?.isActive("bold") ? "bg-[#007FFF] text-white" : "hover:bg-zinc-200/60 text-zinc-700"
                      }`}
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleItalic().run()}
                      className={`h-8 w-8 rounded-lg text-sm italic flex items-center justify-center transition-colors ${
                        editor?.isActive("italic") ? "bg-[#007FFF] text-white" : "hover:bg-zinc-200/60 text-zinc-700"
                      }`}
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleBulletList().run()}
                      className={`h-8 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors ${
                        editor?.isActive("bulletList") ? "bg-[#007FFF] text-white" : "hover:bg-zinc-200/60 text-zinc-700"
                      }`}
                    >
                      List
                    </button>
                  </div>
                  <EditorContent editor={editor} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                    Price (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="mt-2 w-full h-12 px-4 rounded-xl border border-zinc-200 outline-none focus:ring-4 focus:ring-[#007FFF]/10 focus:border-[#007FFF] transition-all"
                    placeholder="Contoh: 50000"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                    Stock <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="mt-2 w-full h-12 px-4 rounded-xl border border-zinc-200 outline-none focus:ring-4 focus:ring-[#007FFF]/10 focus:border-[#007FFF] transition-all"
                    placeholder="Contoh: 10"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                {previewImage && (
                  <div className="mt-4">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                      Preview
                    </p>

                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

                <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                  Thumbnail Image {!editId && <span className="text-red-500">*</span>}
                </label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);

                    const file = e.dataTransfer.files?.[0];

                    if (!file) return;

                    if (!file.type.startsWith("image/")) {
                      alert("File harus gambar");
                      return;
                    }

                    if (previewImage?.startsWith("blob:")) {
                      URL.revokeObjectURL(previewImage);
                    }

                    setThumbnail(file);
                    setPreviewImage(URL.createObjectURL(file));
                  }}
                  className={`mt-2 p-6 border-2 border-dashed rounded-2xl transition-all duration-200 ${
                    isDragging
                      ? "border-[#007FFF] bg-blue-50"
                      : "border-zinc-300 bg-zinc-50/50 hover:bg-zinc-50"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center mb-4 shadow-sm">
                      <Plus size={24} className="text-[#007FFF]" />
                    </div>

                    <p className="font-bold text-zinc-700">
                      Drag & Drop Image
                    </p>

                    <p className="text-sm text-zinc-500 mt-1">
                      atau klik untuk upload gambar
                    </p>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        handleThumbnailFile(file);
                      }}
                      className="hidden"
                      id="thumbnail-upload"
                    />

                    <label
                      htmlFor="thumbnail-upload"
                      className="mt-4 px-5 py-2 rounded-xl bg-[#007FFF] text-white text-sm font-semibold cursor-pointer hover:bg-[#0066CC] transition"
                    >
                      Pilih Gambar
                    </label>
                  </div>
                </div>

                {!thumbnail && !editId && (
                  <p className="text-red-500 text-xs mt-2">
                    Thumbnail wajib diisi
                  </p>
                )}

              {existingGallery.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      Existing Gallery
                    </p>

                    {savingOrder && (
                      <span className="text-[11px] text-[#007FFF] font-semibold animate-pulse">
                        Saving order...
                      </span>
                    )}
                  </div>

                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={existingGallery.map((img) => img.id)}
                      strategy={rectSortingStrategy}
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {existingGallery.map((image, index) => (
                          <SortableGalleryItem
                            key={image.id}
                            image={image}
                          >
                             {(dragHandleProps) => (<div className={`relative aspect-square rounded-2xl overflow-hidden border-2 bg-zinc-50 transition-all ${
                              image.is_primary
                                ? "border-[#007FFF] ring-4 ring-blue-100"
                                : "border-zinc-200"
                            }`}>
                              <img
                                loading="lazy"
                                src={`${BASE_URL}/storage/${image.image}`}
                                alt={`Gallery ${index}`}
                                className="w-full h-full object-cover"
                              />

                              <button
                                type="button"
                                {...dragHandleProps}
                                className="absolute bottom-2 right-2 w-8 h-8 rounded-xl bg-black/60 text-white flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-[#007FFF] transition touch-none"
                              >
                                <GripVertical size={16} />
                              </button>

                              {image.is_primary && (
                                <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-[#007FFF] text-white text-[10px] font-bold shadow">
                                  PRIMARY
                                </div>
                              )}

                              <label className="absolute bottom-2 left-2 bg-white/90 text-xs px-2 py-1 rounded cursor-pointer">
                                Replace
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];

                                    if (!file) return;

                                    setReplaceGallery((prev) => ({
                                      ...prev,
                                      [image.id]: file,
                                    }));
                                  }}
                                />
                              </label>

                              {!image.is_primary && (
                                <button
                                  type="button"
                                  disabled={primaryLoadingId === image.id}
                                  onClick={() =>
                                    handleSetPrimaryImage(image.id)
                                  }
                                  className="absolute top-2 right-10 px-2 py-1 rounded-lg bg-white/90 text-[10px] font-bold text-[#007FFF] hover:bg-[#007FFF] hover:text-white transition disabled:opacity-50"
                                >
                                  {primaryLoadingId === image.id
                                    ? "Loading..."
                                    : "Set Primary"}
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveExistingGallery(image.id)
                                }
                                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-600 transition"
                              >
                                <X size={14} />
                              </button>
                            </div>
                            )}
                          </SortableGalleryItem>
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              )}

              {/* MULTI IMAGE GALLERY */}
              <div>
                {/* PREVIEW GALLERY */}
                {galleryPreview.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                      Gallery Preview
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {galleryPreview.map((img, index) => (
                        <div
                          key={index}
                          className="relative rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50 aspect-square"
                        >
                          <img
                            src={img}
                            alt={`Gallery ${index}`}
                            className="w-full h-full object-cover"
                          />

                          <button
                            type="button"
                            onClick={() => {
                              const newImages = [...galleryImages];
                              const newPreview = [...galleryPreview];

                              URL.revokeObjectURL(newPreview[index]);

                              newImages.splice(index, 1);
                              newPreview.splice(index, 1);

                              setGalleryImages(newImages);
                              setGalleryPreview(newPreview);
                            }}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-600 transition"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                  Gallery Product Images
                </label>

                <div className="mt-2 p-6 border-2 border-dashed border-zinc-300 rounded-2xl bg-zinc-50/50 hover:bg-zinc-50 transition-all">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center mb-4 shadow-sm">
                      <Plus size={24} className="text-[#007FFF]" />
                    </div>

                    <p className="font-bold text-zinc-700">
                      Upload Multiple Images
                    </p>

                    <p className="text-sm text-zinc-500 mt-1">
                      Bisa pilih lebih dari satu gambar
                    </p>

                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      id="gallery-upload"
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        handleGalleryFiles(files);
                      }}
                    />

                    <label
                      htmlFor="gallery-upload"
                      className="mt-4 px-5 py-2 rounded-xl bg-[#007FFF] text-white text-sm font-semibold cursor-pointer hover:bg-[#0066CC] transition"
                    >
                      Pilih Gambar
                    </label>
                  </div>
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-zinc-100 mt-6">
                <button
                  type="button"
                  onClick={closeAndResetModal}
                  className="w-full sm:w-auto h-12 px-5 rounded-xl border border-zinc-200 font-semibold hover:bg-zinc-50 active:scale-[0.98] transition-all text-zinc-600 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingCreate || loadingUpdate}
                  className="w-full sm:w-auto h-12 px-6 rounded-xl bg-[#007FFF] text-white font-semibold shadow-md shadow-[#007FFF]/10 hover:bg-[#0066CC] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all text-sm min-w-[120px]"
                >
                  {loadingCreate || loadingUpdate ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading...</span>
                    </div>
                  ) : editId ? (
                    "Update Product"
                  ) : (
                    "Create Product"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {selectedDeleteProduct && (
        <div className="fixed inset-0 z-[999] bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-zinc-100 overflow-hidden">
            <div className="p-5 sm:p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4 text-red-600">
                <AlertCircle size={26} className="stroke-[2]" />
              </div>

              <h2 className="text-xl font-black text-zinc-900">Delete Product</h2>
              <p className="text-zinc-500 text-sm mt-2 leading-relaxed px-2">
                Apakah Anda yakin ingin menghapus produk{" "}
                <span className="font-bold text-zinc-900">
                  “{selectedDeleteProduct.name}”
                </span>
                ? Tindakan ini tidak dapat dibatalkan.
              </p>

              <div className="flex flex-col-reverse sm:flex-row items-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setSelectedDeleteProduct(null)}
                  className="w-full sm:flex-1 h-12 rounded-xl border border-zinc-200 font-semibold text-zinc-600 hover:bg-zinc-50 active:scale-[0.98] transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteProduct}
                  disabled={deleteLoading}
                  className="w-full sm:flex-1 h-12 rounded-xl bg-red-600 text-white font-semibold shadow-md shadow-red-600/10 hover:bg-red-700 active:scale-[0.98] disabled:opacity-50 transition-all text-sm"
                >
                  {deleteLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Deleting...</span>
                    </div>
                  ) : (
                    "Delete Product"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}