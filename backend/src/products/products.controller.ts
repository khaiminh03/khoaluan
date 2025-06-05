import {
  Controller, Post, Get, Query, Patch, Param, Body, Delete,
  UploadedFiles, UploadedFile, UseInterceptors, NotFoundException
} from '@nestjs/common';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './schemas/product.schema';
import { Types } from 'mongoose';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Tạo sản phẩm mới (upload nhiều ảnh)
  @Post()
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  async create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createProductDto: CreateProductDto,
  ): Promise<Product> {
    const imageFilenames = files.map(file => file.filename);
    return this.productsService.create({
      ...createProductDto,
      images: imageFilenames,
    });
  }

   // Tìm kiếm sản phẩm theo từ khóa
  @Get('search')
  async search(@Query('keyword') keyword: string): Promise<Product[]> {
    if (!keyword || keyword.trim() === '') return [];
    return this.productsService.searchByName(keyword.trim());
  }

  // Lấy tất cả sản phẩm
  @Get()
  async findAll(): Promise<Product[]> {
    return this.productsService.findAll();
  }

  // Lấy sản phẩm theo ID
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Product> {
    const product = await this.productsService.findOne(id);
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  // Lấy theo category
  @Get('by-category-id/:id')
  getByCategoryId(@Param('id') id: string) {
    return this.productsService.getByCategoryId(id);
  }

  // Lấy theo supplier
  @Get('by-supplier/:supplierId')
  getBySupplier(@Param('supplierId') supplierId: string) {
    return this.productsService.getProductsBySupplier(new Types.ObjectId(supplierId));
  }

  // Cập nhật sản phẩm
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    if (updateProductDto.categoryId && typeof updateProductDto.categoryId === 'string') {
      updateProductDto.categoryId = new Types.ObjectId(updateProductDto.categoryId);
    }
    if (updateProductDto.supplierId && typeof updateProductDto.supplierId === 'string') {
      updateProductDto.supplierId = new Types.ObjectId(updateProductDto.supplierId);
    }
    return this.productsService.updateById(id, updateProductDto);
  }

  // Xóa sản phẩm
  @Delete(':id')
  async delete(@Param('id') id: string) {
    const result = await this.productsService.deleteById(id);
    if (!result.deleted) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return { message: 'Product deleted successfully' };
  }

  // Upload ảnh riêng cho sản phẩm đã có
  @Post('upload/:id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  async uploadProductImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
  ) {
    const updated = await this.productsService.updateById(id, {
      images: [file.filename],
    });

    if (!updated) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return { filename: file.filename };
  }
}
