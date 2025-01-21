// Category Modal Component
const CategoryModal = () => (
    <div className="modal fade show" style={{ display: 'block' }}>
        <div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">Add New Category</h5>
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setShowCategoryModal(false)}
                    ></button>
                </div>
                <form onSubmit={handleAddCategory}>
                    <div className="modal-body">
                        <div className="mb-3">
                            <label className="form-label">Category Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                placeholder="Enter category name"
                                required
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setShowCategoryModal(false)}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Add Category
                        </button>
                    </div>
                </form>
            </div>
        </div>
        <div className="modal-backdrop fade show"></div>
    </div>
);