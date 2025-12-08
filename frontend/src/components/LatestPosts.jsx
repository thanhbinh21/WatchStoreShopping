import { useState, useEffect } from "react";
import { postAPI, postCategoryAPI } from "../api/cmsAPI";
import { Calendar, Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function LatestPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await postAPI.getLatest(4);
      const items = Array.isArray(response) ? response : [];

      // Lấy tất cả categoryId duy nhất
      const categoryIds = items
        .map((p) => p.categoryId)
        .filter(Boolean)
        .reduce((acc, id) => (acc.includes(id) ? acc : [...acc, id]), []);

      // Fetch tất cả category
      const categoriesById = {};
      await Promise.all(
        categoryIds.map(async (id) => {
          try {
            const r = await postCategoryAPI.getById(id);
            const cat = (r && r.data) || r;
            if (cat) categoriesById[id] = cat;
          } catch (err) {
            console.log("Error fetching category for id", id, err);
          }
        })
      );

      const enriched = items.map((p) => {
        const cat = categoriesById[p.categoryId];
        console.log("Enrich post", p, "with category", cat);
        const categorySlug = cat?.slug || "uncategorized";
        return { ...p, categorySlug };
      });
      setPosts(enriched);
    } catch (error) {
      console.error("Error loading posts:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading || posts.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Tin Tức & Bài Viết
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Cập nhật thông tin mới nhất về đồng hồ và xu hướng thời trang
          </p>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/posts/${post.postCategory.slug}/${post.slug}`}
              className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
            >
              {/* Cover Image */}
              {post.coverImageUrl && (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.coverImageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {post.postCategory && (
                    <span className="absolute top-3 left-3 bg-brand-primary text-white px-3 py-1 rounded-full text-xs font-medium">
                      {post.postCategory.name}
                    </span>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-brand-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>

                {post.summary && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {post.summary}
                  </p>
                )}

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {formatDate(post.publishedAt || post.createdAt)}
                    </span>
                  </div>
                  {post.viewCount > 0 && (
                    <div className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{post.viewCount}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-10">
          <Link
            to="/posts"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-block px-6 py-3 bg-brand-primary text-white font-medium rounded-lg hover:bg-brand-primary-soft transition-colors"
          >
            Xem tất cả bài viết
          </Link>
        </div>
      </div>
    </section>
  );
}
