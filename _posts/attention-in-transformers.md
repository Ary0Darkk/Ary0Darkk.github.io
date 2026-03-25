---
title: Understanding Attention in Transformers
date: 2026-03-27
description: A deep dive into the attention mechanism that powers modern language models.
---

The attention mechanism is the heart of the Transformer architecture, and understanding it is key to understanding modern NLP. In this post, I'll break down the math behind self-attention and explain why it works so well.

## The Core Idea

Before attention, seq2seq models used RNNs which suffered from vanishing gradients and couldn't parallelize well. Attention allows every position in a sequence to attend to every other position, capturing dependencies regardless of distance.

## Scaled Dot-Product Attention

The attention function can be described as mapping a query and a set of key-value pairs to an output. The output is computed as a weighted sum of the values, where the weights are determined by the compatibility of the query with the corresponding keys.

Mathematically, for matrices $Q$ (queries), $K$ (keys), and $V$ (values):

$$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$$

Let me unpack this step by step.

### 1. Computing Similarity

We first compute the dot product of $Q$ and $K^T$:

$$S = QK^T$$

Each entry $S_{ij}$ represents how well query $i$ matches key $j$. Higher values mean more attention.

### 2. Scaling

We divide by $\sqrt{d_k}$ where $d_k$ is the dimension of the key vectors:

$$S' = \frac{S}{\sqrt{d_k}}$$

This is crucial! Without scaling, the dot products grow with $d_k$, pushing softmax into regions with extremely small gradients. The $\sqrt{d_k}$ keeps the variance of the attention scores stable.

### 3. Softmax

We apply softmax to convert scores into probabilities that sum to 1:

$$\alpha = \text{softmax}(S')$$

Now $\alpha_{ij}$ represents the probability that query $i$ should attend to key $j$.

### 4. Weighted Sum

Finally, we compute the weighted sum of values:

$$\text{Output} = \alpha V$$

## Multi-Head Attention

Single attention is limiting. Instead, we use multiple attention heads in parallel, each learning different patterns:

$$\text{MultiHead}(Q, K, V) = \text{Concat}(\text{head}_1, \ldots, \text{head}_h)W^O$$

where each head is:

$$\text{head}_i = \text{Attention}(QW_i^Q, KW_i^K, VW_i^V)$$

The $W$ matrices are learnable parameters that project the queries, keys, and values into different subspaces. This allows each head to focus on different aspects of the relationships in the data.

## Why It Works

Attention has several advantages:

- **Parallelization**: All positions can be computed simultaneously, unlike RNNs which must process sequentially.
- **Long-range dependencies**: Direct connections between any two positions mean distant relationships are as easy to capture as local ones.
- **Interpretability**: The attention weights show exactly which tokens the model is focusing on.

## Code Implementation

Here's a simplified PyTorch implementation:

```python
import torch
import torch.nn.functional as F

def scaled_dot_product_attention(Q, K, V, mask=None):
    d_k = Q.size(-1)
    scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(d_k)
    
    if mask is not None:
        scores = scores.masked_fill(mask == 0, -1e9)
    
    attention = F.softmax(scores, dim=-1)
    return torch.matmul(attention, V)
```

That's it for this deep dive into attention. Next time, we'll explore how these attention layers stack up to form the full Transformer architecture.