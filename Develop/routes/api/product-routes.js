const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
  // find all products
  // be sure to include its associated Category and Tag data
router.get('/', async(req, res) => {
  try {
    const productData = await Product.findAll({
      include: [
        { model: Category },
        { model: Tag },
        { model: ProductTag },
      ],
    });
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get one product
  // find a single product by its `id`
  // be sure to include its associated Category and Tag data
router.get('/:id', async (req, res) => {
  try {
    const productData = await Product.findByPk(req.params.id, {
      include: [
        { model: Category },
        { model: Tag },
        { model: ProductTag },
      ]
    });
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// create new product
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
router.post('/', (req, res) => {
  Product.create(req.body)
    .then((product) => {
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      res.status(200).json(product);
    })
    .then((productTagIds) => 
    res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
  // update product data
  router.put('/:id', async (req, res) => {
    try {
      const product = await Product.update(req.body, {
        where: {
          id: req.params.id,
        },
      });
  
      if (req.body.tagIds && req.body.tagIds.length) {
        const productTags = await ProductTag.findAll({
          where: {
            product_id: req.params.id,
          },
        });
  
        const productTagIds = productTags.map(({ tag_id }) => tag_id);
        const newProductTags = req.body.tagIds.filter((tag_id) => !productTagIds.includes(tag_id)).map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
  
        const productTagsToRemove = productTags.filter(({ tag_id }) => !req.body.tagIds.includes(tag_id)).map(({ id }) => id);
  
        await Promise.all([
          ProductTag.destroy({
            where: {
              id: productTagsToRemove,
            },
          }),
          ProductTag.bulkCreate(newProductTags),
        ]);
  
        return res.json(product);
      }
  
      return res.json(product);
    } catch (err) {
      res.status(400).json(err);
    }
  });
  
  

  // delete one product by its `id` value
router.delete('/:id', async (req, res) => {
  try {
    const rowsDeleted = await Product.destroy ({
      where: {
        id: req.params.id, 
      }
    });
    if (rowsDeleted > 0) {
      console.log('Product deleted successfully');
    } else {
      console.log('Product not found');
    }
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
