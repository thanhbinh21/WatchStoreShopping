import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { postAPI } from "@/api/cmsAPI";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, Eye, ArrowLeft, Tag } from "lucide-react";
import { toast } from "sonner";

export default function PostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (slug && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadPost();
    }
  }, [slug]);

  const loadPost = async () => {
    try {
      setLoading(true);
      console.log("Loading post with slug:", slug);
      const response = await postAPI.getBySlug(slug);
      console.log("Post response:", response);
      setPost(response);
    } catch (error) {
      console.error("Error loading post:", error);
      console.error("Error details:", error.response);
      if (error.response?.status === 404) {
        toast.error("Không tìm thấy bài viết");
      } else {
        toast.error("Không thể tải bài viết");
      }
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-900"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Không tìm thấy bài viết
            </h2>
            <Link to="/posts" className="text-blue-900 hover:underline">
              Quay lại danh sách bài viết
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Helmet>
        <title>{post.seoTitle || post.title}</title>
        <meta
          name="description"
          content={post.seoDescription || post.summary || post.title}
        />
        {post.seoKeywords && (
          <meta name="keywords" content={post.seoKeywords} />
        )}

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.seoTitle || post.title} />
        <meta
          property="og:description"
          content={post.seoDescription || post.summary || post.title}
        />
        {post.coverImageUrl && (
          <meta property="og:image" content={post.coverImageUrl} />
        )}

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.seoTitle || post.title} />
        <meta
          name="twitter:description"
          content={post.seoDescription || post.summary || post.title}
        />
        {post.coverImageUrl && (
          <meta name="twitter:image" content={post.coverImageUrl} />
        )}
      </Helmet>

      <Header />
      <Navbar />

      <article className="flex-1 py-8">
        <div className="relative">
          {/* Cover Image */}
          {post.coverImageUrl && (
            <div className="w-7xl mx-auto px-4 mb-8">
              <img
                src={post.coverImageUrl}
                alt={post.title}
                className="w-full h-auto object-cover rounded-2xl"
                style={{ maxHeight: "500px" }}
              />
            </div>
          )}

          {/* Content */}
          <div
            className={`max-w-6xl mx-auto px-4 ${
              post.coverImageUrl ? "relative -mt-32" : ""
            }`}
          >
            <div className="bg-white rounded-3xl shadow-2xl p-6 lg:p-8 mb-8">
              {/* Category Badge */}
              {post.postCategory && (
                <Link
                  to={`/posts/category/${post.postCategory.slug}`}
                  className="inline-block bg-red-600 text-white px-3 py-1 rounded text-xs font-bold mb-3 hover:bg-red-700 transition-colors uppercase"
                >
                  {post.postCategory.name}
                </Link>
              )}

              {/* Title */}
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                {post.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 pb-6 mb-6 border-b">
                {post.author && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {post.author.avatar ? (
                        <img
                          src={post.author.avatar}
                          alt={post.author.fullName || post.author.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-600 font-semibold text-sm">
                          {(post.author.fullName || post.author.username)
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-red-600 text-sm">
                        {post.author.fullName || post.author.username}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Ngày cập nhật:{" "}
                          {formatDate(post.publishedAt || post.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Summary */}
              {post.summary && (
                <div className="bg-gray-50 p-5 mb-8 rounded-lg border-l-4 border-red-600">
                  <p className="text-base text-gray-700 leading-relaxed font-medium">
                    {post.summary}
                  </p>
                </div>
              )}

              {/* Content */}
              <div
                className="prose prose-lg max-w-none mb-8 post-content"
                dangerouslySetInnerHTML={{ __html: post.content }}
                style={{
                  fontSize: "1rem",
                  lineHeight: "1.75rem",
                  color: "#374151",
                }}
              />

              {/* Tags */}
              {post.tags && (
                <div className="flex flex-wrap items-center gap-2 pt-8 border-t">
                  <Tag className="w-4 h-4 text-gray-600" />
                  {post.tags.split(",").map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}
