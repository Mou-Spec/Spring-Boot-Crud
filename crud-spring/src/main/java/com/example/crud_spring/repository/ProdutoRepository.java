package com.example.crud_spring.repository;

import com.example.crud_spring.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto,Long>{
    List<Produto> findByNomeContainingIgnoreCase(String nome);
    List <Produto> findByPrecoBetween(Double precoMin,Double precoMax);
    List<Produto> findByQuantidadeGreaterThan(Integer quantidade);
}
