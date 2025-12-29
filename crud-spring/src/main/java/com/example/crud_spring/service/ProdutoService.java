package com.example.crud_spring.service;

import com.example.crud_spring.model.Produto;
import com.example.crud_spring.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProdutoService {

    @Autowired
    private ProdutoRepository repository;

    public List<Produto> listarTodos(){
        return repository.findAll();
    }

    public Optional<Produto> buscarPorId(Long id){
        return repository.findById(id);
    }

    public List<Produto> buscarPorNome(String nome){
        return repository.findByNomeContainingIgnoreCase(nome);
    }

    public Produto salvar(Produto produto){
        return repository.save(produto);
    }

    public Produto atualizar(Long id, Produto produtoAtualizado) {
        return repository.findById(id)
                .map(produto -> {
                    produto.setNome(produtoAtualizado.getNome());
                    produto.setDescricao(produtoAtualizado.getDescricao());
                    produto.setPreco(produtoAtualizado.getPreco());
                    produto.setQuantidade(produtoAtualizado.getQuantidade());
                    return repository.save(produto);
                })
                .orElseGet(() -> {
                    produtoAtualizado.setId(id);
                    return repository.save(produtoAtualizado);
                });
    }

    public void deletarPorId(Long id){
        repository.deleteById(id);
    }

    public boolean existePorId(Long id){
        return repository.existsById(id);
    }
}
