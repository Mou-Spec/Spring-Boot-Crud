 
        const API_URL = 'http://localhost:8080/api/produtos';
        
        // Elementos dom
        const productForm = document.getElementById('product-form');
        const productsTableBody = document.getElementById('products-table-body');
        const productsTable = document.getElementById('products-table');
        const loadingElement = document.getElementById('loading');
        const noProductsElement = document.getElementById('no-products');
        const searchInput = document.getElementById('search-input');
        const messageElement = document.getElementById('message');
        const messageText = document.getElementById('message-text');
        const closeMessageButton = document.getElementById('close-message');
        const refreshButton = document.getElementById('refresh-btn');
        const clearButton = document.getElementById('clear-btn');
        const cancelEditButton = document.getElementById('cancel-edit-btn');
        const editActions = document.getElementById('edit-actions');
        const submitButton = document.getElementById('submit-btn');
        const productIdInput = document.getElementById('product-id');
        const productIdDisplay = document.getElementById('product-id-display');
        
        // Estado da aplicação
        let isEditing = false;
        let allProducts = [];
        
        document.addEventListener('DOMContentLoaded', function() {
            loadProducts();
            setupEventListeners();
        });
        
        
        function setupEventListeners() {
            
            productForm.addEventListener('submit', handleFormSubmit);
            
            
            clearButton.addEventListener('click', clearForm);
            refreshButton.addEventListener('click', loadProducts);
            cancelEditButton.addEventListener('click', cancelEdit);
            closeMessageButton.addEventListener('click', hideMessage);
            
            
            searchInput.addEventListener('input', debounce(handleSearch, 300));
        }
        
        // Carregar produtos 
        async function loadProducts() {
            showLoading();
            
            try {
                const response = await fetch(API_URL);
                
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                
                allProducts = await response.json();
                displayProducts(allProducts);
                hideLoading();
                
                if (allProducts.length === 0) {
                    showNoProductsMessage();
                } else {
                    showMessage(`Carregados ${allProducts.length} produtos`, 'success');
                }
            } catch (error) {
                console.error('Erro ao carregar produtos:', error);
                hideLoading();
                showNoProductsMessage();
                showMessage('Erro ao carregar produtos. Verifique se a API está rodando.', 'error');
            }
        }
        
        // Exibir produtos 
        function displayProducts(products) {
            productsTableBody.innerHTML = '';
            
            if (products.length === 0) {
                productsTable.classList.add('hidden');
                noProductsElement.classList.remove('hidden');
                return;
            }
            
            productsTable.classList.remove('hidden');
            noProductsElement.classList.add('hidden');
            
            products.forEach(product => {
                const row = document.createElement('tr');
                
                const createdDate = product.dataCriacao ? 
                    new Date(product.dataCriacao).toLocaleDateString('pt-BR') : '--';
                
                const shortDescription = product.descricao.length > 80 ? 
                    product.descricao.substring(0, 80) + '...' : product.descricao;
                
                row.innerHTML = `
                    <td>
                        <strong>${product.nome}</strong><br>
                        <small>Criado em: ${createdDate}</small>
                    </td>
                    <td>${shortDescription}</td>
                    <td class="price-cell"><span class="price-badge">R$ ${product.preco.toFixed(2)}</span></td>
                    <td class="quantity-cell"><span class="quantity-badge">${product.quantidade} un.</span></td>
                    <td>
                        <div class="product-actions">
                            <button class="action-btn edit-btn" onclick="editProduct(${product.id})" 
                                    title="Editar produto">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete-btn" onclick="deleteProduct(${product.id})" 
                                    title="Excluir produto">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
                
                productsTableBody.appendChild(row);
            });
        }
        
        async function handleFormSubmit(event) {
            event.preventDefault();
            
            
            const productData = {
                nome: document.getElementById('nome').value,
                descricao: document.getElementById('descricao').value,
                preco: parseFloat(document.getElementById('preco').value),
                quantidade: parseInt(document.getElementById('quantidade').value)
            };
            
            
            if (!validateProductData(productData)) {
                return;
            }
            
            
            if (isEditing) {
                productData.id = parseInt(productIdInput.value);
            }
            
            try {
                let response;
                
                if (isEditing) {
                    
                    response = await fetch(`${API_URL}/${productData.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(productData)
                    });
                    
                    if (!response.ok) {
                        throw new Error(`Erro HTTP: ${response.status}`);
                    }
                    
                    showMessage('Produto atualizado com sucesso!', 'success');
                } else {
                    
                    response = await fetch(API_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(productData)
                    });
                    
                    if (!response.ok) {
                        throw new Error(`Erro HTTP: ${response.status}`);
                    }
                    
                    showMessage('Produto criado com sucesso!', 'success');
                }
                
                const savedProduct = await response.json();
                
                
                loadProducts();
                clearForm();
                
                
                if (isEditing) {
                    cancelEdit();
                }
                
            } catch (error) {
                console.error('Erro ao salvar produto:', error);
                showMessage('Erro ao salvar produto. Verifique os dados e tente novamente.', 'error');
            }
        }
        
        function validateProductData(product) {
            if (!product.nome || product.nome.trim().length < 3) {
                showMessage('O nome deve ter pelo menos 3 caracteres', 'error');
                return false;
            }
            
            if (!product.descricao || product.descricao.trim().length < 10) {
                showMessage('A descrição deve ter pelo menos 10 caracteres', 'error');
                return false;
            }
            
            if (!product.preco || product.preco <= 0) {
                showMessage('O preço deve ser maior que zero', 'error');
                return false;
            }
            
            if (!product.quantidade || product.quantidade < 0) {
                showMessage('A quantidade não pode ser negativa', 'error');
                return false;
            }
            
            return true;
        }
        
        async function editProduct(id) {
            try {
                const response = await fetch(`${API_URL}/${id}`);
                
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                
                const product = await response.json();
                
                document.getElementById('nome').value = product.nome;
                document.getElementById('descricao').value = product.descricao;
                document.getElementById('preco').value = product.preco;
                document.getElementById('quantidade').value = product.quantidade;
                document.getElementById('form-section').classList.add('edit-mode');
                
                productIdInput.value = product.id;
                productIdDisplay.textContent = `ID: ${product.id}`;
                submitButton.innerHTML = '<i class="fas fa-save"></i> Atualizar Produto';
                submitButton.classList.remove('btn-primary');
                submitButton.classList.add('btn-warning');
                
                editActions.classList.remove('hidden');
                isEditing = true;
                
                document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
                
                showMessage(`Editando produto "${product.nome}"`, 'success');
                
            } catch (error) {
                console.error('Erro ao carregar produto para edição:', error);
                showMessage('Erro ao carregar produto para edição', 'error');
            }
        }
        
        async function deleteProduct(id) {
            if (!confirm('Tem certeza que deseja excluir este produto?')) {
                return;
            }
            
            try {
                const response = await fetch(`${API_URL}/${id}`, {
                    method: 'DELETE'
                });
                
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                
                loadProducts();
                showMessage('Produto excluído com sucesso!', 'success');
                
            } catch (error) {
                console.error('Erro ao excluir produto:', error);
                showMessage('Erro ao excluir produto', 'error');
            }
        }
        
        function clearForm() {
            productForm.reset();
            productIdInput.value = '';
            productIdDisplay.textContent = 'ID: --';
        }

        function cancelEdit() {
            
            clearForm();
            
            
            editActions.classList.add('hidden');
            
            
            submitButton.innerHTML = '<i class="fas fa-save"></i> Salvar Produto';
            submitButton.classList.remove('btn-warning');
            submitButton.classList.add('btn-primary');
            
            
            document.getElementById('form-section').classList.remove('edit-mode');
            
            isEditing = false;
            showMessage('Edição cancelada', 'success');
        }
        
        async function handleSearch() {
            const searchTerm = searchInput.value.trim();
            
            if (!searchTerm) {
                displayProducts(allProducts);
                return;
            }
            
            try {
                const response = await fetch(`${API_URL}/buscar?nome=${encodeURIComponent(searchTerm)}`);
                
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                
                const filteredProducts = await response.json();
                displayProducts(filteredProducts);
                
            } catch (error) {
                console.error('Erro ao buscar produtos:', error);
                showMessage('Erro ao buscar produtos', 'error');
            }
        }
        
        function loadSampleData() {
            const sampleProducts = [
                {
                    nome: "Notebook Gamer",
                    descricao: "Notebook com processador i7, 16GB RAM, SSD 512GB, GPU RTX 3060",
                    preco: 5499.99,
                    quantidade: 15
                },
                {
                    nome: "Smartphone Android",
                    descricao: "Smartphone com tela AMOLED 6.5', 128GB armazenamento, câmera tripla 48MP",
                    preco: 2199.90,
                    quantidade: 32
                },
                {
                    nome: "Fone de Ouvido Bluetooth",
                    descricao: "Fone com cancelamento de ruído ativo, bateria de 30 horas, à prova d'água",
                    preco: 399.50,
                    quantidade: 45
                },
                {
                    nome: "Monitor 4K 27",
                    descricao: "Monitor UHD 4K, taxa de atualização 144Hz, compatível com HDR10",
                    preco: 1899.00,
                    quantidade: 8
                }
            ];
            
            let addedCount = 0;
            
            sampleProducts.forEach(async (product, index) => {
                try {
                    const response = await fetch(API_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(product)
                    });
                    
                    if (response.ok) {
                        addedCount++;
                        
                        if (addedCount === sampleProducts.length) {
                            
                            setTimeout(() => {
                                loadProducts();
                                showMessage(`${addedCount} produtos de exemplo adicionados`, 'success');
                            }, 500);
                        }
                    }
                } catch (error) {
                    console.error('Erro ao adicionar produto de exemplo:', error);
                }
            });
        }
        
        function showMessage(text, type) {
            messageText.textContent = text;
            messageElement.className = `message message-${type}`;
            messageElement.classList.remove('hidden');
            
            setTimeout(() => {
                if (!messageElement.classList.contains('hidden')) {
                    messageElement.classList.add('hidden');
                }
            }, 5000);
        }
        
        function hideMessage() {
            messageElement.classList.add('hidden');
        }
        
        function showLoading() {
            loadingElement.classList.remove('hidden');
            productsTable.classList.add('hidden');
            noProductsElement.classList.add('hidden');
        }
        
        function hideLoading() {
            loadingElement.classList.add('hidden');
        }
        
        function showNoProductsMessage() {
            productsTable.classList.add('hidden');
            noProductsElement.classList.remove('hidden');
        }
        
        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }