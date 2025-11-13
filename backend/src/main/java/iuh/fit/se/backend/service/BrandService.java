package iuh.fit.se.backend.service;

import iuh.fit.se.backend.entity.Brand;
import iuh.fit.se.backend.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BrandService {
    private final BrandRepository brandRepository;


    public List<Brand> getAllBrands() {
        return brandRepository.findAll();
    }

    public Brand getBrandById(Long id) {return brandRepository.findById(id).orElse(null);}

    public Brand getBrand(Long id) {
        return brandRepository.findById(id).orElse(null);
    }

    public Brand saveBrand(Brand brand) {
        return brandRepository.save(brand);
    }

    public void deleteBrand(Long id) {
        brandRepository.deleteById(id);
    }
}
