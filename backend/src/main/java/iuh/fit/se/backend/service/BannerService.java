package iuh.fit.se.backend.service;

import iuh.fit.se.backend.dto.request.BannerRequest;
import iuh.fit.se.backend.entity.Banner;
import iuh.fit.se.backend.repository.BannerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BannerService {
    private final BannerRepository bannerRepository;

    @Transactional
    public Banner createBanner(BannerRequest request) {
        Banner banner = new Banner();
        banner.setTitle(request.getTitle());
        banner.setImageUrl(request.getImageUrl());
        banner.setLinkUrl(request.getLinkUrl());
        banner.setDescription(request.getDescription());
        banner.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0);
        banner.setActive(request.getActive() != null ? request.getActive() : true);

        return bannerRepository.save(banner);
    }

    @Transactional
    public Banner updateBanner(Long id, BannerRequest request) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found"));

        banner.setTitle(request.getTitle());
        banner.setImageUrl(request.getImageUrl());
        banner.setLinkUrl(request.getLinkUrl());
        banner.setDescription(request.getDescription());
        banner.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0);
        banner.setActive(request.getActive() != null ? request.getActive() : true);

        return bannerRepository.save(banner);
    }

    @Transactional
    public void deleteBanner(Long id) {
        bannerRepository.deleteById(id);
    }

    public Banner getBannerById(Long id) {
        return bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found"));
    }

    public List<Banner> getAllBanners() {
        return bannerRepository.findAllByOrderByDisplayOrderAsc();
    }

    public List<Banner> getActiveBanners() {
        return bannerRepository.findByActiveOrderByDisplayOrderAsc(true);
    }
}
