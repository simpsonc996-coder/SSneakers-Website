import express from "express"; // Express framework
import Product from "../models/Product.js"; // Mongoose model (schema)
import { protect, admin } from "../middleware/authMiddleware.js"; // admin = are you allowed to do admin actions? protect = who are you?
import { seedSampleProducts } from "../utils/seedProducts.js";

const router = express.Router();

// protect (JWT → req.user)
// admin (req.user.role === "admin"?)
// create product
// @route POST /api/products
// @desc Create new product in the database
// @access Private/Admin
router.post("/", protect, admin, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      countInStock,
      category,
      brand,
      sizes,
      colors,
      collections,
      material,
      gender,
      images,
      isFeatured,
      isPublished,
      tags,
      dimensions,
      weight,
      sku,
    } = req.body;

    const product = new Product({
      name,
      description,
      price,
      discountPrice,
      countInStock,
      category,
      brand,
      sizes,
      colors,
      collections,
      material,
      gender,
      images,
      isFeatured,
      isPublished,
      tags,
      dimensions,
      weight,
      sku,
      user: req.user._id, // Reference to the admin user who created it. user: req.user._id is attached by 'protect' middleware. _id is MongoDB's object ID. This creates a reference to the admin who created the product
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error!" });
  }
});

// @route PUT /api/products
// @desc Update an existing product ID
// @access Private/Admin
router.put("/:id", protect, admin, async (req, res) => {
    try {
        const {
          name,
          description,
          price,
          discountPrice,
          countInStock,
          category,
          brand,
          sizes,
          colors,
          collections,
          material,
          gender,
          images,
          isFeatured,
          isPublished,
          tags,
          dimensions,
          weight,
          sku,
        } = req.body;

        // Find the product by ID
        const product = await Product.findById(req.params.id);

        if (product) {
            // Update product fields. If something exists, keep that value. Else, update it
            product.name = name || product.name;
            product.description = description || product.description;
            product.price = price || product.price;
            product.discountPrice = discountPrice || product.discountPrice;
            product.countInStock = countInStock || product.countInStock;
            product.category = category || product.category;
            product.brand = brand || product.brand;
            product.sizes = sizes || product.sizes;
            product.colors = colors || product.colors;
            product.collections = collections || product.collections;
            product.material = material || product.material;
            product.gender = gender || product.gender;
            product.images = images || product.images;
            product.isFeatured = isFeatured !== undefined ? isFeatured : product.isFeatured;
            product.isPublished = isPublished !== undefined ? isPublished : product.isPublished;
            product.tags = tags || product.tags;
            product.dimensions = dimensions || product.dimensions;
            product.weight = weight || product.weight;
            product.sku = sku || product.sku;

            // Save the updated product to the database
            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error!" });
    }
});

// @route DELETE /api/products/:id
// @desc Delete a product by ID
// @access Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
    try {
        // Find the product by ID
        const product = await Product.findById(req.params.id);

        // If the product exists
        if (product) {
            // Remove the product from the database
            await product.deleteOne();
            res.json({ message: "Product removed successfully" });
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error!" });
    }
});

// @route GET /api/products
// @desc Get all products with optional query filters
// @access Public
router.get("/", async (req, res) => {
    try {
        const { collection, size, color, gender, minPrice, maxPrice, sortBy, search, category, material, brand, limit } = req.query;
        let query = {};

        // Filtering logic
        if (collection && collection.toLocaleLowerCase() !== "all") {
            query.collections = collection;
        }

        if (size && size.toLocaleLowerCase() !== "all") {
            query.sizes = { $in: size.split(",") };
        }

        if (material) {
            query.material = { $in: material.split(",") };
        }

        if (brand) {
          query.brand = { $in: brand.split(",") };
        }

        if (size) {
          query.sizes = { $in: size.split(",") };
        }

        if(color) {
            query.colors = { $in: [color] };
        }

        if (gender) {
            query.gender = gender;
        }

        if (category) {
            query.category = category;
        }

        if(minPrice || maxPrice) {
            query.price = {};
            if(minPrice) query.price.$gte = Number(minPrice);
            if(maxPrice) query.price.$lte = Number(maxPrice);
        }

        if(search) {
            query.$or = [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]; // 'i' means case sensitive
        }

        // Sort logic
        let sort = {};
        if (sortBy) {
            switch (sortBy) {
                case "priceAsc":
                    sort = { price: 1 };
                    break;
                case "priceDesc":
                    sort = { price: -1 };
                    break;
                case "popularity":
                    sort = { rating: -1 };
                    break;
                default:
                    break;
            }
        }

        // Fetch products and apply sorting and limit
        let products = await Product.find(query).sort(sort).limit(Number(limit) || 0);
        res.json(products);

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error!" });
    }
});

// @route GET /api/products/best-seller
// @desc Get best-selling products based on highest rated products
// @access Public
router.get("/best-seller", async (req, res) => {
    try {
        const bestSeller = await Product.findOne().sort({ rating: -1 });
        if (bestSeller) {
            res.json(bestSeller);
        } else {
            res.status(404).json({ message: "No best seller found" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error!" });
    }
});

// @route GET /api/products/new-arrivals
// @desc Get newly added 8 products sorted by creation date
// @access Public
router.get("/new-arrivals", async (req, res) => {
    try {
        // Fetch the 8 most recently created products
        const newArrivals = await Product.find().sort({ createdAt: -1 }).limit(8);
        res.json(newArrivals);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error!" });
    }
});

// @route POST /api/products/seed
// @desc Seed sample products if the catalogue is empty
// @access Public
router.post("/seed", async (req, res) => {
    try {
        const result = await seedSampleProducts({ reset: false });
        res.json({ message: "Sample products ready", ...result });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to seed sample products" });
    }
});

// @route GET /api/products/similar/:id
// @desc Get similar products based on current product's gender and category
// @access Public
router.get("/similar/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const similarProducts = await Product.find({
            _id: { $ne: id }, // Exclude the current product
            gender: product.gender,
            category: product.category,
        }).limit(4); // Limit to 4 similar products

        res.json(similarProducts);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error!" });
    }
});

// @route GET /api/products/:id
// @desc Get a single product by ID
// @access Public
router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error!" });
    }
});

export default router;