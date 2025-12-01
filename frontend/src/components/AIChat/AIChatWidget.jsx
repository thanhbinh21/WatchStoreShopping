import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, Search as SearchIcon, Sparkles, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getProducts } from '@/api/productAPI';
import { searchProductsByName } from '@/api/findAPI';
import { getCategories } from '@/api/categoryAPI';
import { addToGuestCart } from '@/api/guestCart';
import { getCart, addToCart } from '@/api/cartAPI';
import { parseStoredUser } from '@/utils/storage';

// Floating AI Chat widget for suggestions/search/autocategorize
export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('suggest'); // suggest, search, categorize
  const [suggestions, setSuggestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [chatMessages, setChatMessages] = useState([]); // {role: 'user'|'assistant', content}
  const [isThinking, setIsThinking] = useState(false);
  const [categories, setCategories] = useState([]);
  const [textToCategorize, setTextToCategorize] = useState('');
  const [categoryMatches, setCategoryMatches] = useState([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const navigate = useNavigate();
  const user = parseStoredUser();
  const userRole = localStorage.getItem('role');
  const hideForAdmin = userRole === 'ADMIN' || userRole === 'STAFF' || userRole === 'MANAGER';

  useEffect(() => {
    // fetch categories for autocategorize
    async function loadCategories() {
      const cats = await getCategories();
      setCategories(Array.isArray(cats) ? cats : (cats?.data || []));
    }
    loadCategories();
  }, []);

  useEffect(() => {
    if (open && tab === 'suggest') {
      loadSuggestions();
    }
  }, [open, tab]);

  const loadSuggestions = async () => {
    setSuggestLoading(true);
    try {
      // Simple suggestions: promotional products or newest products
      const res = await getProducts({ page: 0, size: 8, sortBy: 'id', order: 'desc' });
      const content = res?.content || [];
      setSuggestions(content.slice(0, 8));
    } catch (e) {
      console.error('AI suggestions error', e);
      setSuggestions([]);
    } finally { setSuggestLoading(false); }
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const res = await searchProductsByName(searchQuery.trim());
      setSearchResults(Array.isArray(res) ? res : (res?.content || []));
    } catch (err) {
      console.error('AI search error', err);
      setSearchResults([]);
      toast.error('Tìm kiếm thất bại');
    }
  };

  const sendMessageToAI = async (message) => {
    setIsThinking(true);
    const recordUser = { role: 'user', content: message, id: Date.now() };
    setChatMessages(prev => [...prev, recordUser]);
    try {
      // Try backend endpoint first
      const apiResp = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      if (apiResp.ok) {
        const data = await apiResp.json();
        const reply = data?.reply || data?.text || data?.message || 'Không có phản hồi';
        setChatMessages(prev => [...prev, { role: 'assistant', content: reply, id: Date.now() }]);
        setIsThinking(false);
        return;
      }
      // If backend not available, fallback to OpenAI if key present in localStorage
      const apiKey = localStorage.getItem('openai_api_key');
      if (!apiKey) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: 'Không có backend AI cấu hình và không tìm thấy OpenAI API key. Vui lòng cấu hình để bật AI.', id: Date.now() }]);
        setIsThinking(false);
        return;
      }
      const openaiResp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: message }],
          max_tokens: 700,
        }),
      });
      if (!openaiResp.ok) {
        const errText = await openaiResp.text();
        setChatMessages(prev => [...prev, { role: 'assistant', content: 'Lỗi khi gọi OpenAI: ' + errText, id: Date.now() }]);
        setIsThinking(false);
        return;
      }
      const openaiResult = await openaiResp.json();
      const replyText = openaiResult?.choices?.[0]?.message?.content || 'Không có trả lời từ AI.';
      setChatMessages(prev => [...prev, { role: 'assistant', content: replyText, id: Date.now() }]);
    } catch (err) {
      console.error('AI chat send error', err);
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Lỗi khi gửi yêu cầu AI.', id: Date.now() }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleAddToCart = async (product) => {
    const token = localStorage.getItem('accessToken');
    const user = parseStoredUser();
    try {
      if (!token || !user?.id) {
        addToGuestCart(product, 1);
        toast.success('Đã thêm vào giỏ hàng (Khách)');
        return;
      }
      // logged-in add to cart
      await addToCart(user.id, product.id, 1);
      toast.success('Đã thêm vào giỏ hàng');
    } catch (err) {
      console.error('Error add to cart', err);
      toast.error('Thêm vào giỏ hàng thất bại');
    }
  };

  const handleAutoCategorize = () => {
    if (!textToCategorize.trim()) {
      toast.error('Vui lòng nhập nội dung để phân loại');
      return;
    }
    const text = textToCategorize.toLowerCase();
    const matches = categories.filter(cat => {
      const name = (cat.name || '').toLowerCase();
      // Basic match: if category name appears in the text
      if (!name) return false;
      if (text.includes(name)) return true;
      // Also match by words
      return name.split(/\s+/).some(w => w && text.includes(w));
    });
    setCategoryMatches(matches);
    if (matches.length === 0) {
      toast('Không tìm thấy danh mục phù hợp', { duration: 3000 });
    } else {
      toast.success(`Gợi ý danh mục: ${matches[0].name}`);
    }
  };

  if (hideForAdmin) return null;

  return (
    <>
      {/* Floating Button (AI) */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="fixed bottom-20 right-6 z-60 bg-red-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
        title="AI Assistant"
      >
        <span className="font-bold">AI</span>
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-28 right-6 z-60 w-[360px] h-[480px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="bg-red-600 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-white rounded-full w-8 h-8 flex items-center justify-center text-red-600 font-bold">AI</div>
              <div>
                <h4 className="text-sm font-semibold">AI Assistant</h4>
                <p className="text-xs opacity-90">Gợi ý • Tìm kiếm • Tự động phân loại</p>
              </div>
            </div>
            <div className="text-xs opacity-90">Beta</div>
          </div>
          <div className="p-3 flex flex-col gap-3 h-full">
            <div className="flex gap-2">
              <button onClick={() => setTab('suggest')} className={`flex-1 py-2 rounded-lg ${tab === 'suggest' ? 'bg-red-50 text-red-600 font-semibold' : 'bg-gray-100 text-gray-700'}`}><Sparkles size={16} className="inline mr-2"/>Gợi ý</button>
              <button onClick={() => setTab('search')} className={`flex-1 py-2 rounded-lg ${tab === 'search' ? 'bg-red-50 text-red-600 font-semibold' : 'bg-gray-100 text-gray-700'}`}><SearchIcon size={16} className="inline mr-2"/>Tìm kiếm</button>
              <button onClick={() => setTab('chat')} className={`flex-1 py-2 rounded-lg ${tab === 'chat' ? 'bg-red-50 text-red-600 font-semibold' : 'bg-gray-100 text-gray-700'}`}><MessageCircle size={16} className="inline mr-2"/>Chat</button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {tab === 'suggest' && (
                <div>
                  {suggestLoading ? <div>Loading suggestions...</div> : (
                    <div className="grid grid-cols-1 gap-2">
                      {suggestions.map(p => (
                        <div key={p.id} className="flex items-center gap-3 p-2 border rounded hover:bg-gray-50">
                          <img src={p.imageUrl || p.primaryImageUrl} alt={p.name} className="w-12 h-12 object-cover rounded" />
                          <div className="flex-1">
                            <div className="text-sm font-medium">{p.name}</div>
                            <div className="text-xs text-gray-500">{p.discountedPrice ? `${p.discountedPrice.toLocaleString('vi-VN')}₫` : (p.currentPrice || p.price) + '₫'}</div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <button onClick={() => navigate(`/product/${p.id}`)} className="text-xs text-blue-600">Xem</button>
                            <button onClick={() => handleAddToCart(p)} className="text-xs text-green-600">Thêm</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tab === 'search' && (
                <div>
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Tìm sản phẩm theo tên" className="flex-1 px-3 py-2 border rounded" />
                    <button type="submit" className="px-3 py-2 bg-red-600 text-white rounded">Tìm</button>
                  </form>
                  <div className="mt-3 grid gap-2">
                    {searchResults.map(r => (
                      <div key={r.id} className="flex items-center gap-3 p-2 border rounded hover:bg-gray-50">
                        <img src={r.imageUrl || r.primaryImageUrl} alt={r.name} className="w-12 h-12 object-cover rounded" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{r.name}</div>
                          <div className="text-xs text-gray-500">{r.currentPrice ? `${r.currentPrice.toLocaleString('vi-VN')}` : r.price}</div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <button onClick={() => navigate(`/product/${r.id}`)} className="text-xs text-blue-600">Xem</button>
                          <button onClick={() => handleAddToCart(r)} className="text-xs text-green-600">Thêm</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === 'chat' && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {chatMessages.length === 0 ? (
                      <div className="text-xs text-gray-500">Bạn có thể hỏi AI để được gợi ý, tìm kiếm hoặc trợ giúp.</div>
                    ) : (
                      chatMessages.map(msg => (
                        <div key={msg.id} className={`p-2 rounded ${msg.role === 'user' ? 'bg-red-50 text-red-700 text-right' : 'bg-gray-100 text-gray-800'}`}>
                          <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="mt-2">
                    <form onSubmit={async (e)=>{ e.preventDefault(); if (!searchQuery.trim()) return; await sendMessageToAI(searchQuery.trim()); setSearchQuery(''); }} className="flex gap-2">
                      <input value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} placeholder="Hỏi AI..." className="flex-1 px-3 py-2 border rounded" />
                      <button disabled={isThinking || !searchQuery.trim()} className="px-3 py-2 bg-red-600 text-white rounded">Gửi</button>
                    </form>
                    {isThinking && <div className="text-xs mt-2 text-gray-500">AI đang trả lời...</div>}
                  </div>
                </div>
              )}

            </div>

            <div className="border-t pt-3">
              <h5 className="text-sm font-semibold mb-2">Tự động phân loại</h5>
              <textarea value={textToCategorize} onChange={(e)=>setTextToCategorize(e.target.value)} rows={3} placeholder="Dán tên hoặc mô tả sản phẩm để gợi ý danh mục" className="w-full px-3 py-2 border rounded" />
              <div className="mt-2 flex gap-2">
                <button onClick={handleAutoCategorize} className="flex-1 py-2 bg-red-600 text-white rounded">Gợi ý danh mục</button>
                <button onClick={()=>{ setTextToCategorize(''); toast('Đã xóa') }} className="py-2 bg-gray-100 rounded">Xóa</button>
              </div>
              {categoryMatches && categoryMatches.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs text-gray-500 mb-1">Kết quả gợi ý:</div>
                  <div className="flex flex-col gap-2">
                    {categoryMatches.map(cat => (
                      <button key={cat.id} onClick={() => navigate(`/products?category=${cat.id}`)} className="text-left px-2 py-2 rounded border hover:bg-gray-50">{cat.name}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => {
                const key = window.prompt('Nhập OpenAI API key (hoặc để trống để bỏ cấu hình):');
                if (typeof key === 'string') {
                  if (!key) {
                    localStorage.removeItem('openai_api_key');
                    toast('Đã xóa API key');
                  } else {
                    localStorage.setItem('openai_api_key', key.trim());
                    toast.success('Đã lưu API key');
                  }
                }
              }} className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded">API key</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
