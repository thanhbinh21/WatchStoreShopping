import React, { useState, useEffect, useRef } from "react";
import Breadcrumb from "../components/Breadcrumb.jsx";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getCurrentUser, updateCurrentUser } from "@/api/userAPI";
import { uploadAvatar } from "@/api/uploadAPI";
import { toast } from "sonner";
import Header from "@/components/Header.jsx";

export const User = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    fullName: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    postalCode: "",
    avatarUrl: "",
    dateOfBirth: "",
  });
  const [localPreview, setLocalPreview] = useState(null);
  const fileInputRef = useRef(null);
  const prevObjectUrlRef = useRef(null);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState("");
  const [selectedDistrictCode, setSelectedDistrictCode] = useState("");
  const [selectedWardCode, setSelectedWardCode] = useState("");
  const [street, setStreet] = useState("");

  const fetchProvinces = async () => {
    try {
      const res = await fetch("https://provinces.open-api.vn/api/p/");
      const json = await res.json();
      setProvinces(json || []);
      return json || [];
    } catch (err) {
      console.error("Failed to load provinces", err);
      setProvinces([]);
      return [];
    }
  };

  const fetchDistricts = async (provinceCode) => {
    if (!provinceCode) {
      setDistricts([]);
      return [];
    }
    try {
      const res = await fetch(
        `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`
      );
      const json = await res.json();
      const list = (json && json.districts) || [];
      setDistricts(list);
      return list;
    } catch (err) {
      console.error("Failed to load districts", err);
      setDistricts([]);
      return [];
    }
  };
  useEffect(() => {
    const init = async () => {
      try {
        const provs = await fetchProvinces();

        const res = await getCurrentUser();
        const data = res?.data?.data || res?.data || res;
        if (data) {
          // try to split address into street, ward, district, province
          const addr = data.address || "";
          const parts = addr
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          // street is first segment if present
          const streetPart = parts.length > 0 ? parts[0] : "";
          // province name is last part if present else fallback to data.city
          const provinceName =
            parts.length > 0 ? parts[parts.length - 1] : data.city || "";

          // find province by name (case-insensitive)
          const prov = provs.find(
            (p) =>
              p.name &&
              p.name.toLowerCase() === (provinceName || "").toLowerCase()
          );

          let cityName = data.city || "";
          if (prov) {
            setSelectedProvinceCode(prov.code);
            cityName = prov.name;
            const dists = await fetchDistricts(prov.code);
            // district name assumed second-last part
            const districtName =
              parts.length > 1 ? parts[parts.length - 2] : "";
            const dist = dists.find(
              (d) =>
                d.name &&
                d.name.toLowerCase() === (districtName || "").toLowerCase()
            );
            if (dist) {
              setSelectedDistrictCode(dist.code);
              const wardsList = await fetchWards(dist.code);
              const wardName = parts.length > 2 ? parts[parts.length - 3] : "";
              const wardObj = wardsList.find(
                (w) =>
                  w.name &&
                  w.name.toLowerCase() === (wardName || "").toLowerCase()
              );
              if (wardObj) {
                setSelectedWardCode(wardObj.code);
              }
            }
          }

          setProfile({
            username: data.username || "",
            email: data.email || "",
            fullName: data.fullName || "",
            phone: data.phone || "",
            address: data.address || "",
            city: cityName || "",
            country: data.country || "",
            postalCode: data.postalCode || "",
            avatarUrl: data.avatarUrl || "",
            dateOfBirth: data.dateOfBirth ? data.dateOfBirth : "",
          });
          setStreet(streetPart);
        }
      } catch (err) {
        console.error("Failed to load profile", err);
        toast.error("Không thể tải thông tin tài khoản");
      } finally {
        setLoading(false);
      }
    };
    init();
    return () => {
      // cleanup object URL when component unmounts
      try {
        if (prevObjectUrlRef.current) {
          URL.revokeObjectURL(prevObjectUrlRef.current);
          prevObjectUrlRef.current = null;
        }
      } catch (err) {
        // ignore
      }
    };
  }, []);
  // generic profile field updater
  const handleChange = (e) => {
    const name = e?.target?.name;
    const value = e?.target?.value;
    if (!name) return;
    setProfile((p) => ({ ...p, [name]: value }));
  };
  const fetchWards = async (districtCode) => {
    if (!districtCode) return setWards([]);
    try {
      const res = await fetch(
        `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`
      );
      const json = await res.json();
      const list = (json && json.wards) || [];
      setWards(list);
      return list;
    } catch (err) {
      console.error("Failed to load wards", err);
      setWards([]);
      return [];
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        fullName: profile.fullName,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        country: profile.country,
        postalCode: profile.postalCode,
        avatarUrl: profile.avatarUrl,
        dateOfBirth: profile.dateOfBirth || null,
      };
      const res = await updateCurrentUser(payload);
      const data = res?.data?.data || res?.data || res;
      toast.success("Cập nhật thông tin thành công");
      setProfile({
        username: data.username || "",
        email: data.email || "",
        fullName: data.fullName || "",
        phone: data.phone || "",
        address: data.address || "",
        city: data.city || "",
        country: data.country || "",
        postalCode: data.postalCode || "",
        avatarUrl: data.avatarUrl || "",
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth : "",
      });
      try {
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: data.id,
            username: data.username,
            email: data.email,
            fullName: data.fullName,
            phone: data.phone || null,
            address: data.address || null,
            city: data.city || null,
            country: data.country || null,
            postalCode: data.postalCode || null,
            avatarUrl: data.avatarUrl || null,
            dateOfBirth: data.dateOfBirth || null,
          })
        );
        window.dispatchEvent(new CustomEvent("userUpdated", { detail: data }));
      } catch (e) {
        console.warn("Failed to persist updated user:", e);
      }
    } catch (err) {
      console.error("Update profile error", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        "Cập nhật thất bại";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Breadcrumb />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Hồ sơ của tôi</h1>
              <p className="text-sm text-muted-foreground">
                Xem và chỉnh sửa thông tin tài khoản
              </p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left column: avatar & quick actions */}
            <div className="col-span-1 flex flex-col items-center">
              {localPreview || profile.avatarUrl ? (
                <img
                  src={localPreview || profile.avatarUrl}
                  alt="avatar"
                  className="w-32 h-32 rounded-full object-cover border"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center text-3xl font-bold text-gray-500 border">
                  {profile.fullName
                    ? profile.fullName.charAt(0).toUpperCase()
                    : profile.username?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
              <h3 className="mt-4 font-medium">
                {profile.fullName || profile.username}
              </h3>
              <p className="text-sm text-muted-foreground">{profile.email}</p>

              {profile.phone && (
                <p className="text-sm text-muted-foreground">
                  SĐT: {profile.phone}
                </p>
              )}
              {(profile.address || profile.city || profile.country) && (
                <p className="text-sm text-muted-foreground">
                  {profile.address ? profile.address + ", " : ""}
                  {/* {profile.city ? profile.city + ", " : ""} */}
                  {profile.country || ""}
                </p>
              )}

              <div className="mt-6 w-full flex gap-2 justify-center">
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = "/change-password")}
                >
                  Đổi mật khẩu
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (confirm("Bạn có chắc muốn đăng xuất?")) {
                      localStorage.removeItem("accessToken");
                      localStorage.removeItem("refreshToken");
                      window.location.href = "/login";
                    }
                  }}
                >
                  Đăng xuất
                </Button>
              </div>

              {/* Styled file chooser for avatar */}
              <div className="mt-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files && e.target.files[0];
                    if (!f) return;
                    // revoke previous preview URL if any
                    try {
                      if (prevObjectUrlRef.current) {
                        URL.revokeObjectURL(prevObjectUrlRef.current);
                        prevObjectUrlRef.current = null;
                      }
                    } catch (err) {
                      /* ignore */
                    }

                    // show local preview immediately
                    let objectUrl = null;
                    try {
                      objectUrl = URL.createObjectURL(f);
                      prevObjectUrlRef.current = objectUrl;
                      setLocalPreview(objectUrl);
                    } catch (err) {
                      console.warn("preview error", err);
                    }

                    // upload in background
                    try {
                      const resp = await uploadAvatar(f);
                      const url =
                        resp?.url ||
                        (resp?.fileNames &&
                          `/images/avatars/${resp.fileNames[0]}`);
                      if (url) {
                        setProfile((p) => ({ ...p, avatarUrl: url }));
                        toast.success("Upload ảnh đại diện thành công");
                      } else {
                        toast.error("Không nhận được URL ảnh từ server");
                      }
                    } catch (err) {
                      console.error("Upload avatar failed", err);
                      toast.error("Upload ảnh thất bại");
                    }
                  }}
                />

                <div className="flex gap-2 items-center">
                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current && fileInputRef.current.click()
                    }
                    className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Chọn ảnh đại diện
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Kích thước tối đa 5MB. Định dạng: JPG/PNG/WEBP
                  </span>
                </div>
              </div>
            </div>

            {/* Right column: editable form */}
            <div className="col-span-2">
              {loading ? (
                <div>Đang tải...</div>
              ) : (
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSave();
                  }}
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tên đăng nhập
                    </label>
                    <Input
                      name="username"
                      value={profile.username}
                      onChange={handleChange}
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <Input
                      name="email"
                      type="email"
                      value={profile.email}
                      onChange={handleChange}
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Họ và tên
                    </label>
                    <Input
                      name="fullName"
                      value={profile.fullName}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Số điện thoại
                    </label>
                    <Input
                      name="phone"
                      value={profile.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Thành phố
                      </label>
                      <Input
                        name="city"
                        value={profile.city}
                        onChange={handleChange}
                      />
                    </div> */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Quốc gia
                      </label>
                      <Input
                        name="country"
                        value={profile.country}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Mã bưu chính
                      </label>
                      <Input
                        name="postalCode"
                        value={profile.postalCode}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Tỉnh/Thành
                        </label>
                        <select
                          className="mt-1 block w-full rounded border p-2"
                          value={selectedProvinceCode}
                          onChange={async (e) => {
                            const code = e.target.value;
                            setSelectedProvinceCode(code);
                            setSelectedDistrictCode("");
                            setSelectedWardCode("");
                            setDistricts([]);
                            setWards([]);
                            if (code) {
                              await fetchDistricts(code);
                              const prov = provinces.find(
                                (p) => String(p.code) === String(code)
                              );
                              setProfile((p) => ({
                                ...p,
                                city: prov?.name || p.city,
                                country: "Việt Nam",
                              }));
                            }
                            // recompute address
                            const wardObj = wards.find(
                              (w) => String(w.code) === String(selectedWardCode)
                            );
                            const districtObj = districts.find(
                              (d) =>
                                String(d.code) === String(selectedDistrictCode)
                            );
                            const provinceObj = provinces.find(
                              (p) => String(p.code) === String(code)
                            );
                            const composed = [
                              street,
                              wardObj?.name,
                              districtObj?.name,
                              provinceObj?.name,
                            ]
                              .filter(Boolean)
                              .join(", ");
                            setProfile((p) => ({ ...p, address: composed }));
                          }}
                        >
                          <option value="">Chọn tỉnh/thành</option>
                          {provinces.map((prov) => (
                            <option key={prov.code} value={prov.code}>
                              {prov.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Quận/Huyện
                        </label>
                        <select
                          className="mt-1 block w-full rounded border p-2"
                          value={selectedDistrictCode}
                          onChange={async (e) => {
                            const code = e.target.value;
                            setSelectedDistrictCode(code);
                            setSelectedWardCode("");
                            setWards([]);
                            if (code) {
                              await fetchWards(code);
                              const dist = districts.find(
                                (d) => String(d.code) === String(code)
                              );
                              // recompute address
                              const wardObj = wards.find(
                                (w) =>
                                  String(w.code) === String(selectedWardCode)
                              );
                              const provinceObj = provinces.find(
                                (p) =>
                                  String(p.code) ===
                                  String(selectedProvinceCode)
                              );
                              const composed = [
                                street,
                                wardObj?.name,
                                dist?.name,
                                provinceObj?.name,
                              ]
                                .filter(Boolean)
                                .join(", ");
                              setProfile((p) => ({ ...p, address: composed }));
                            }
                          }}
                          disabled={districts.length === 0}
                        >
                          <option value="">Chọn quận/huyện</option>
                          {districts.map((d) => (
                            <option key={d.code} value={d.code}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Phường/Xã
                        </label>
                        <select
                          className="mt-1 block w-full rounded border p-2"
                          value={selectedWardCode}
                          onChange={(e) => {
                            const code = e.target.value;
                            setSelectedWardCode(code);
                            const wardObj = wards.find(
                              (w) => String(w.code) === String(code)
                            );
                            const districtObj = districts.find(
                              (d) =>
                                String(d.code) === String(selectedDistrictCode)
                            );
                            const provinceObj = provinces.find(
                              (p) =>
                                String(p.code) === String(selectedProvinceCode)
                            );
                            const composed = [
                              street,
                              wardObj?.name,
                              districtObj?.name,
                              provinceObj?.name,
                            ]
                              .filter(Boolean)
                              .join(", ");
                            setProfile((p) => ({ ...p, address: composed }));
                          }}
                          disabled={wards.length === 0}
                        >
                          <option value="">Chọn phường/xã</option>
                          {wards.map((w) => (
                            <option key={w.code} value={w.code}>
                              {w.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <label className="block text-sm font-medium text-gray-700 mt-3">
                      Địa chỉ chi tiết
                    </label>
                    <Input
                      name="street"
                      placeholder="Số nhà, tên đường"
                      value={street}
                      onChange={(e) => {
                        setStreet(e.target.value);
                        // update composed address preview
                        const wardObj = wards.find(
                          (w) => String(w.code) === String(selectedWardCode)
                        );
                        const districtObj = districts.find(
                          (d) => String(d.code) === String(selectedDistrictCode)
                        );
                        const provinceObj = provinces.find(
                          (p) => String(p.code) === String(selectedProvinceCode)
                        );
                        const composed = [
                          e.target.value,
                          wardObj?.name,
                          districtObj?.name,
                          provinceObj?.name,
                        ]
                          .filter(Boolean)
                          .join(", ");
                        setProfile((p) => ({ ...p, address: composed }));
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Avatar (URL)
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        name="avatarUrl"
                        value={profile.avatarUrl}
                        onChange={handleChange}
                        disabled
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Ngày sinh
                    </label>
                    <Input
                      name="dateOfBirth"
                      type="date"
                      value={profile.dateOfBirth || ""}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="flex items-center justify-end pt-4">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {saving ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
