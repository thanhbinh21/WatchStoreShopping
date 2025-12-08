import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import { postAPI, postCategoryAPI } from "@/api/cmsAPI";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import Footer from "@/components/Footer";
import PostDetailContent from "@/components/PostDetailContent";
import { Calendar, Eye, Tag, ChevronLeft, ChevronRight } from "lucide-react";
import { AdminPagination } from "@/components/Pagination";
import { toast } from "sonner";

export default function PostList() {
  const { categorySlug, postSlug } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loadingPost, setLoadingPost] = useState(false);
  const itemsPerPage = 9;
  const slideIntervalRef = useRef(null);

  useEffect(() => {
    loadCategories();
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, currentPage]);

  useEffect(() => {
    let active = true;

    async function fetchForParams() {
      setLoading(true);

      // 1) Two-segment route: /posts/:categorySlug/:postSlug
      const catSlug = categorySlug;
      const pSlug = postSlug;

      if (catSlug && pSlug) {
        try {
          const category = await postCategoryAPI.getBySlug(catSlug);
          if (!active) return;
          setSelectedCategory(category || null);
        } catch {
          if (!active) return;
          setSelectedCategory(null);
        }

        try {
          await loadPostBySlug(pSlug);
        } finally {
          if (active) setLoading(false);
        }

        return;
      }

      // 2) Single-segment: prefer treating `categorySlug` as category, fallback to post
      const single = categorySlug;
      if (single) {
        try {
          const category = await postCategoryAPI.getBySlug(single);
          if (!active) return;
          if (category && category.id) {
            setSelectedCategory(category);
            setSelectedPost(null);
            setCurrentPage(1);
            setLoading(false);
            return;
          }
        } catch {
          if (!active) return;
        }

        // fallback: try post
        try {
          await loadPostBySlug(single);
        } finally {
          if (active) setLoading(false);
        }

        return;
      }

      // no params: clear
      if (active) {
        setSelectedPost(null);
        setSelectedCategory(null);
        setLoading(false);
      }
    }

    fetchForParams();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorySlug, postSlug]);

  // Auto-play slider
  useEffect(() => {
    if (posts.length > 1) {
      slideIntervalRef.current = setInterval(() => {
        setCurrentSlide((prev) =>
          prev === Math.min(5, posts.length) - 1 ? 0 : prev + 1
        );
      }, 5000);

      return () => {
        if (slideIntervalRef.current) {
          clearInterval(slideIntervalRef.current);
        }
      };
    }
  }, [posts.length]);

  const loadCategories = async () => {
    try {
      const response = await postCategoryAPI.getAll();
      const categoriesArray = Array.isArray(response) ? response : [];
      // Chỉ lấy categories có status ACTIVE
      const activeCategories = categoriesArray.filter(
        (cat) => cat.status === "ACTIVE"
      );
      setCategories(activeCategories);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      let response;

      if (selectedCategory) {
        response = await postAPI.getByCategory(
          selectedCategory.id,
          currentPage - 1,
          itemsPerPage
        );
      } else {
        response = await postAPI.getPublished(currentPage - 1, itemsPerPage);
      }

      if (response && response.content !== undefined) {
        setPosts(response.content || []);
        setTotalPages(response.totalPages || 0);
      } else if (Array.isArray(response)) {
        setPosts(response);
        setTotalPages(Math.ceil(response.length / itemsPerPage));
      } else {
        setPosts([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("Error loading posts:", error);
      toast.error("Không thể tải danh sách bài viết");
      setPosts([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setSelectedPost(null);
    navigate(`${category ? `/posts/${category.slug}` : "/posts"}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const timeStr = date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${dateStr} ${timeStr}`;
  };

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    const strippedText = text.replace(/<[^>]*>/g, "");
    if (strippedText.length <= maxLength) return strippedText;
    return strippedText.substring(0, maxLength) + "...";
  };

  const loadPostBySlug = async (postSlug) => {
    try {
      setLoadingPost(true);
      const response = await postAPI.getBySlug(postSlug);
      setSelectedPost(response);
      // If post has a category, set it so breadcrumbs and category state are correct
      if (response?.postCategory) {
        setSelectedCategory(response.postCategory);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Error loading post:", error);
      toast.error("Không thể tải bài viết");
      navigate("/posts");
    } finally {
      setLoadingPost(false);
    }
  };

  const handlePostClick = async (e, post) => {
    if (e) e.preventDefault();
    const catSlug = post.postCategory?.slug || "";
    if (catSlug) {
      navigate(`/posts/${catSlug}/${post.slug}`);
    } else {
      navigate(`/posts/${post.slug}`);
    }
  };

  const handleBackToList = () => {
    navigate("/posts");
  };

  const breadcrumbItems = (() => {
    const items = [{ label: "Tin tức & Bài viết", href: "/posts" }];
    if (selectedCategory) {
      items.push({
        label: selectedCategory.name,
        href: `/posts/${selectedCategory.slug}`,
      });
    }
    if (selectedPost) {
      items.push({ label: selectedPost.title, isCurrent: true });
    } else if (!selectedCategory) {
      items[0].isCurrent = true;
    }
    return items;
  })();

  // Component wrapper for clickable post items
  const PostLink = ({ post, children, className }) => (
    <div
      onClick={(e) => handlePostClick(e, post)}
      className={`${className} cursor-pointer`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handlePostClick(e, post);
        }
      }}
    >
      {children}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Helmet>
        <title>Tin tức & Bài viết - Cửa hàng đồng hồ</title>
        <meta
          name="description"
          content="Đọc tin tức, bài viết mới nhất về đồng hồ, xu hướng thời trang và công nghệ"
        />
      </Helmet>

      <Header />
      <Breadcrumb items={breadcrumbItems} />

      <main className="flex-1 py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Tin tức & Bài viết
            </h1>
            <p className="text-gray-600">
              Cập nhật tin tức mới nhất về đồng hồ, thời trang và xu hướng
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar - Categories */}
            <aside className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm p-6 lg:sticky lg:top-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b">
                  Danh mục
                </h2>
                <nav className="space-y-2">
                  <button
                    onClick={() => handleCategoryChange(null)}
                    className={`cursor-pointer w-full text-left px-4 py-3 rounded-lg text-md font-medium transition-colors ${
                      !selectedCategory
                        ? "bg-brand-accent-soft text-brand-accent"
                        : "text-brand-ink hover:bg-gray-50"
                    }`}
                  >
                    Trang chủ
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category)}
                      className={`cursor-pointer w-full text-left px-4 py-3 rounded-lg text-md font-medium transition-colors ${
                        selectedCategory?.id === category.id
                          ? "bg-brand-accent-soft text-brand-accent"
                          : "text-brand-ink hover:bg-gray-50"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Right Content Area */}
            <div className="lg:col-span-9">
              {/* Post Detail View */}
              {selectedPost ? (
                <PostDetailContent
                  post={selectedPost}
                  formatDate={formatDate}
                />
              ) : loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
                </div>
              ) : loadingPost ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
                  <p className="ml-4 text-gray-600">Đang tải bài viết...</p>
                </div>
              ) : posts.length === 0 ? (
                /* Empty State */
                <div className="bg-white rounded-lg shadow-sm p-20 text-center">
                  <p className="text-gray-500 text-lg">Không có bài viết nào</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {!selectedCategory ? (
                    /* Homepage Layout - Full Featured */
                    <>
                      {/* Section 1: Chủ đề hot - Horizontal Scroll */}
                      <div>
                        <div className="flex flex-col gap-3 mb-4">
                          <h2 className="text-2xl font-bold uppercase">
                            Chủ đề hot
                          </h2>
                          <div
                            className="h-1 bg-brand-primary"
                            style={{ width: "100px" }}
                          ></div>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                          {categories.slice(0, 8).map((category) => (
                            <button
                              key={category.id}
                              onClick={() => handleCategoryChange(category)}
                              className="shrink-0 w-32 h-32 bg-white rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden group relative"
                            >
                              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"></div>
                              <div className="absolute bottom-0 left-0 right-0 p-3">
                                <span className="text-white font-bold text-sm line-clamp-2">
                                  #{category.name}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Section 2: Nổi bật nhất - Main Featured Post */}
                      <div>
                        <div className="flex flex-col gap-3 mb-4">
                          <h2 className="text-2xl font-bold uppercase">
                            Nổi bật nhất
                          </h2>
                          <div
                            className="h-1 bg-brand-primary"
                            style={{ width: "120px" }}
                          ></div>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-6">
                          <div className="">
                            {posts
                              .slice()
                              .sort(
                                (a, b) =>
                                  (b.viewCount || 0) - (a.viewCount || 0)
                              )[0] && (
                              <PostLink
                                post={
                                  posts
                                    .slice()
                                    .sort(
                                      (a, b) =>
                                        (b.viewCount || 0) - (a.viewCount || 0)
                                    )[0]
                                }
                                className="block bg-white rounded-lg shadow-sm hover:shadow-xl transition-shadow overflow-hidden group relative"
                              >
                                {posts
                                  .slice()
                                  .sort(
                                    (a, b) =>
                                      (b.viewCount || 0) - (a.viewCount || 0)
                                  )[0].coverImageUrl && (
                                  <div className="aspect-video overflow-hidden">
                                    <img
                                      src={
                                        posts
                                          .slice()
                                          .sort(
                                            (a, b) =>
                                              (b.viewCount || 0) -
                                              (a.viewCount || 0)
                                          )[0].coverImageUrl
                                      }
                                      alt={
                                        posts
                                          .slice()
                                          .sort(
                                            (a, b) =>
                                              (b.viewCount || 0) -
                                              (a.viewCount || 0)
                                          )[0].title
                                      }
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                  </div>
                                )}
                                <div className="absolute top-4 left-4">
                                  <span className="bg-brand-primary text-white px-3 py-1 rounded text-xs font-bold uppercase">
                                    Đánh giá
                                  </span>
                                </div>
                                <div className="p-6">
                                  <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-brand-primary transition-colors line-clamp-2">
                                    {
                                      posts
                                        .slice()
                                        .sort(
                                          (a, b) =>
                                            (b.viewCount || 0) -
                                            (a.viewCount || 0)
                                        )[0].title
                                    }
                                  </h2>
                                  {posts
                                    .slice()
                                    .sort(
                                      (a, b) =>
                                        (b.viewCount || 0) - (a.viewCount || 0)
                                    )[0].summary && (
                                    <p className="text-gray-600 mb-4 line-clamp-2">
                                      {truncateText(
                                        posts
                                          .slice()
                                          .sort(
                                            (a, b) =>
                                              (b.viewCount || 0) -
                                              (a.viewCount || 0)
                                          )[0].summary,
                                        200
                                      )}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-4 h-4" />
                                      {formatDate(
                                        posts
                                          .slice()
                                          .sort(
                                            (a, b) =>
                                              (b.viewCount || 0) -
                                              (a.viewCount || 0)
                                          )[0].publishedAt ||
                                          posts
                                            .slice()
                                            .sort(
                                              (a, b) =>
                                                (b.viewCount || 0) -
                                                (a.viewCount || 0)
                                            )[0].createdAt
                                      )}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Eye className="w-4 h-4" />
                                      {posts
                                        .slice()
                                        .sort(
                                          (a, b) =>
                                            (b.viewCount || 0) -
                                            (a.viewCount || 0)
                                        )[0].viewCount || 0}
                                    </span>
                                  </div>
                                </div>
                              </PostLink>
                            )}
                          </div>
                          <div className="">
                            {posts
                              .slice()
                              .sort(
                                (a, b) =>
                                  (b.viewCount || 0) - (a.viewCount || 0)
                              )
                              .slice(1, 6)
                              .map((post) => (
                                <PostLink
                                  key={post.id}
                                  post={post}
                                  className="flex gap-4 bg-white rounded-lg p-4 hover:shadow-md transition-shadow group"
                                >
                                  {post.coverImageUrl && (
                                    <div className="shrink-0 w-32 h-24 rounded overflow-hidden">
                                      <img
                                        src={post.coverImageUrl}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-brand-primary transition-colors">
                                      {post.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                      {truncateText(post.summary, 80)}
                                    </p>
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {formatDate(
                                          post.publishedAt || post.createdAt
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </PostLink>
                              ))}
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Tin tức mới nhất & Góc Chọn & Mua */}
                      <div className="grid lg:grid-cols-2 gap-6">
                        {/* Left: Tin tức mới nhất */}
                        <div>
                          <div className="flex flex-col gap-3 mb-4">
                            <h2 className="text-2xl font-bold uppercase">
                              Tin tức mới nhất
                            </h2>
                            <div
                              className="h-1 bg-brand-primary"
                              style={{ width: "150px" }}
                            ></div>
                          </div>

                          <div className="space-y-4">
                            {posts
                              .slice()
                              .sort(
                                (a, b) =>
                                  new Date(b.createdAt) - new Date(a.createdAt)
                              )
                              .slice(1, 6)
                              .map((post) => (
                                <PostLink
                                  key={post.id}
                                  post={post}
                                  className="flex gap-4 bg-white rounded-lg p-4 hover:shadow-md transition-shadow group"
                                >
                                  {post.coverImageUrl && (
                                    <div className="shrink-0 w-32 h-24 rounded overflow-hidden">
                                      <img
                                        src={post.coverImageUrl}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-brand-primary transition-colors">
                                      {post.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                      {truncateText(post.summary, 80)}
                                    </p>
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {formatDate(
                                          post.publishedAt || post.createdAt
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </PostLink>
                              ))}
                          </div>
                        </div>

                        {/* Right: Góc Chọn & Mua */}
                        <div>
                          <div className="flex flex-col gap-3 mb-4">
                            <h2 className="text-2xl font-bold">
                              Góc Chọn & Mua
                            </h2>
                            <div
                              className="h-1 bg-brand-primary"
                              style={{ width: "130px" }}
                            ></div>
                          </div>

                          <div className="space-y-4">
                            {posts
                              .filter((post) =>
                                post.postCategory?.name
                                  ?.toLowerCase()
                                  .includes("công nghệ")
                              )
                              .slice(0, 4)
                              .map((post, index) => (
                                <PostLink
                                  key={post.id}
                                  post={post}
                                  className="block group"
                                >
                                  {index === 0 ? (
                                    <div className="bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                      {post.coverImageUrl && (
                                        <div className="aspect-video overflow-hidden">
                                          <img
                                            src={post.coverImageUrl}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                          />
                                        </div>
                                      )}
                                      <div className="p-4">
                                        <h3 className="font-bold text-gray-900 line-clamp-2 group-hover:text-brand-primary transition-colors">
                                          {post.title}
                                        </h3>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex gap-3 bg-white rounded-lg p-3 hover:shadow-md transition-shadow">
                                      {post.coverImageUrl && (
                                        <div className="shrink-0 w-24 h-20 rounded overflow-hidden">
                                          <img
                                            src={post.coverImageUrl}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                          />
                                        </div>
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-sm text-gray-900 line-clamp-2 group-hover:text-brand-primary transition-colors">
                                          {post.title}
                                        </h3>
                                      </div>
                                    </div>
                                  )}
                                </PostLink>
                              ))}
                          </div>
                        </div>
                      </div>

                      {/* Section 4: Xem nhiều tuần qua - Grid */}
                      <div>
                        <div className="flex flex-col gap-3 mb-4">
                          <h2 className="text-2xl font-bold uppercase">
                            Xem nhiều tuần qua
                          </h2>
                          <div
                            className="h-1 bg-brand-primary"
                            style={{ width: "180px" }}
                          ></div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                          {posts
                            .slice()
                            .sort(
                              (a, b) => (b.viewCount || 0) - (a.viewCount || 0)
                            )
                            .slice(0, 5)
                            .map((post) => (
                              <PostLink
                                key={post.id}
                                post={post}
                                className="block bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow group"
                              >
                                {post.coverImageUrl && (
                                  <div className="aspect-video overflow-hidden">
                                    <img
                                      src={post.coverImageUrl}
                                      alt={post.title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                  </div>
                                )}
                                <div className="p-3">
                                  <h3 className="font-bold text-sm text-gray-900 line-clamp-2 group-hover:text-brand-primary transition-colors">
                                    {post.title}
                                  </h3>
                                  <p className="text-xs text-gray-500 mt-2">
                                    {formatDate(
                                      post.publishedAt || post.createdAt
                                    )}
                                  </p>
                                </div>
                              </PostLink>
                            ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Category Layout - Simplified */
                    <>
                      {/* Section 1: Nổi bật nhất - Slider */}
                      <div>
                        <div className="flex flex-col gap-3 mb-4">
                          <h2 className="text-2xl font-bold">NỔI BẬT NHẤT</h2>
                          <div
                            className="h-1 bg-brand-primary"
                            style={{
                              width: `${selectedCategory.name.length * 16}px`,
                            }}
                          ></div>
                        </div>

                        <div className="relative bg-white rounded-lg shadow-sm overflow-hidden group">
                          <div className="relative overflow-hidden">
                            <div
                              className="flex transition-transform duration-500 ease-in-out"
                              style={{
                                transform: `translateX(-${
                                  currentSlide * 100
                                }%)`,
                              }}
                            >
                              {posts
                                .slice()
                                .sort(
                                  (a, b) =>
                                    (b.viewCount || 0) - (a.viewCount || 0)
                                )
                                .slice(0, Math.min(3, posts.length))
                                .map((post) => (
                                  <div key={post.id} className="min-w-full">
                                    <PostLink post={post} className="block">
                                      <div className="grid md:grid-cols-2 gap-0">
                                        {post.coverImageUrl && (
                                          <div className="aspect-video md:aspect-auto overflow-hidden">
                                            <img
                                              src={post.coverImageUrl}
                                              alt={post.title}
                                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                          </div>
                                        )}
                                        <div className="p-6 flex flex-col justify-center">
                                          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 hover:text-brand-primary transition-colors line-clamp-3">
                                            {post.title}
                                          </h2>
                                          {post.summary && (
                                            <p className="text-gray-600 mb-4 line-clamp-3">
                                              {truncateText(post.summary, 150)}
                                            </p>
                                          )}
                                          <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                              <Calendar className="w-4 h-4" />
                                              {formatDate(
                                                post.publishedAt ||
                                                  post.createdAt
                                              )}
                                            </span>
                                            <span className="flex items-center gap-1">
                                              <Eye className="w-4 h-4" />
                                              {post.viewCount || 0}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </PostLink>
                                  </div>
                                ))}
                            </div>
                          </div>

                          {posts.length > 1 && (
                            <>
                              <button
                                onClick={() =>
                                  setCurrentSlide((prev) =>
                                    prev === 0
                                      ? Math.min(3, posts.length) - 1
                                      : prev - 1
                                  )
                                }
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 z-10"
                              >
                                <ChevronLeft className="w-6 h-6" />
                              </button>
                              <button
                                onClick={() =>
                                  setCurrentSlide((prev) =>
                                    prev === Math.min(3, posts.length) - 1
                                      ? 0
                                      : prev + 1
                                  )
                                }
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 z-10"
                              >
                                <ChevronRight className="w-6 h-6" />
                              </button>
                            </>
                          )}

                          {posts.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                              {posts
                                .slice(0, Math.min(3, posts.length))
                                .map((_, index) => (
                                  <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`w-2 h-2 rounded-full transition-all ${
                                      currentSlide === index
                                        ? "bg-brand-primary w-8"
                                        : "bg-white/60 hover:bg-white/80"
                                    }`}
                                  />
                                ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Section 2: Two Column Layout */}
                      <div className="grid md:grid-cols-12 gap-6">
                        {/* Left: Tin tức cập nhật */}
                        <div className="md:col-span-7">
                          <div className="flex flex-col gap-3 mb-4">
                            <h2 className="text-2xl font-bold uppercase">
                              Tin tức cập nhật
                            </h2>
                            <div
                              className="h-1 bg-brand-primary"
                              style={{ width: "140px" }}
                            ></div>
                          </div>

                          <div className="space-y-4">
                            {posts.slice(3, 6).map((post) => (
                              <PostLink
                                key={post.id}
                                post={post}
                                className="flex gap-4 bg-white rounded-lg p-4 hover:shadow-md transition-shadow group"
                              >
                                {post.coverImageUrl && (
                                  <div className="shrink-0 w-28 h-20 rounded overflow-hidden">
                                    <img
                                      src={post.coverImageUrl}
                                      alt={post.title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-brand-primary transition-colors">
                                    {post.title}
                                  </h3>
                                  <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {formatDate(
                                        post.publishedAt || post.createdAt
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </PostLink>
                            ))}
                          </div>
                        </div>

                        {/* Right: Xem nhiều tuần qua */}
                        <div className="md:col-span-5">
                          <div className="flex flex-col gap-3 mb-4">
                            <h2 className="text-2xl font-bold">
                              Xem nhiều tuần qua
                            </h2>
                            <div
                              className="h-1 bg-brand-primary"
                              style={{ width: "160px" }}
                            ></div>
                          </div>

                          <div className="space-y-4">
                            {posts
                              .slice()
                              .sort(
                                (a, b) =>
                                  (b.viewCount || 0) - (a.viewCount || 0)
                              )
                              .slice(0, 3)
                              .map((post) => (
                                <PostLink
                                  key={post.id}
                                  post={post}
                                  className="block bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow group"
                                >
                                  {post.coverImageUrl && (
                                    <div className="aspect-video overflow-hidden">
                                      <img
                                        src={post.coverImageUrl}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      />
                                    </div>
                                  )}
                                  <div className="p-4">
                                    <h3 className="font-bold text-gray-900 line-clamp-2 group-hover:text-brand-primary transition-colors">
                                      {post.title}
                                    </h3>
                                  </div>
                                </PostLink>
                              ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <AdminPagination
                      page={currentPage}
                      totalPages={totalPages}
                      handlePageChange={setCurrentPage}
                      handlePrev={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      handleNext={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
