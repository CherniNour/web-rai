function makeCrud(Model, { populates = [] } = {}) {
  async function list(req, res) {
    try {
      const q = req.query.q ? String(req.query.q) : '';
      let filter = {};
      if (q) {
        const textFields = Model.schema.paths
          ? Object.entries(Model.schema.paths)
              .filter(([, p]) => p.instance === 'String' && p.options.searchable !== false)
              .map(([k]) => k)
          : [];
        if (textFields.length) {
          filter.$or = textFields.map((f) => ({ [f]: { $regex: q, $options: 'i' } }));
        }
      }
      let query = Model.find(filter);
      if (populates.length) query = query.populate(populates);
      const items = await query.sort({ createdAt: -1 }).lean();
      res.json(items);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async function getOne(req, res) {
    try {
      let query = Model.findById(req.params.id);
      if (populates.length) query = query.populate(populates);
      const item = await query.lean();
      if (!item) return res.status(404).json({ message: 'Élément introuvable' });
      res.json(item);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async function create(req, res) {
    try {
      const item = await Model.create(req.body);
      res.status(201).json(item);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async function update(req, res) {
    try {
      const item = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!item) return res.status(404).json({ message: 'Élément introuvable' });
      res.json(item);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async function remove(req, res) {
    try {
      const item = await Model.findByIdAndDelete(req.params.id);
      if (!item) return res.status(404).json({ message: 'Élément introuvable' });
      res.json({ message: 'Supprimé avec succès' });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  return { list, getOne, create, update, remove };
}

module.exports = makeCrud;
