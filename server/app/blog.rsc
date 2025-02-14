2:I[80490,["404","static/chunks/app/blog/page-eb62e4baca68860a.js"],"AllPosts"]
5:I[48071,[],""]
6:I[58073,[],""]
7:I[28522,["522","static/chunks/522-d1feed2a8dc6bdb8.js","709","static/chunks/709-2772e7dce5e6a6e1.js","815","static/chunks/815-b72fe04fcceb75ca.js","931","static/chunks/app/page-236d86b9169f16be.js"],""]
3:T23cc,# I accidentally implemented the fastest pairwise cosine similarity function

<TimingChart />

While searching for a way to efficiently compute pairwise cosine similarity between vectors, I created a simple and efficient implementation using PyTorch. The function runs blazingly fast. It is faster than the popular `cosine_similarity` function from `sklearn` and the naive loop-based implementations.

```
def pairwise_cosine_similarity(tensor: Tensor) -> Tensor:
    """
    Args:
        tensor: A tensor of shape (N, D) where N is the number of
        vectors and D is the dimensionality of the vectors.
    Returns:
        A tensor of shape (N, N) containing the cosine similarity
        between all pairs of vectors.
    """

    tmm = torch.mm(tensor, tensor.T)
    denom = torch.sqrt(tmm.diagonal()).unsqueeze(0)
    denom_mat = torch.mm(denom.T, denom)
    return torch.nan_to_num(tmm / denom_mat)
```

## About cosine similarity
Cosine similarity is a intuitive metric to measure similarity between two vectors. It is widely used in vision, recommendation systems, search engines, and natural language processing. The cosine similarity between two vectors is defined as the cosine of the angle between them, ranging from -1 to 1, where 1 means the vectors are identical, -1 means they are opposite, and 0 means they are orthogonal.

Edit (March 2024): Be cautious about using cosine similarity when working with embeddings. Please check out [Is Cosine-Similarity of Embeddings Really About
Similarity?](https://arxiv.org/pdf/2403.05440.pdf)

## Why pairwise similarity is slow
We usually want to compute the cosine similarity between all pairs of vectors. This enables do things like searching for similar vectors (similar images), analyzing the structure of the vector space (clustering images). However, with a large matrix, computing the cosine similarity can be computationally expensive.

We often find ourselves having a matrix of shape $(N, D)$ where $N$ is the number of vectors and $D$ is the dimensionality of the vectors. $D$ is also called the embedding size or dimension, which is typically a power of 2, e.g. 64, 512, 1024, 4096, etc.

## The method
The method is based on the following formula:

<center>
$$\text{sim}(v_i, v_j) = \displaystyle\frac{v_i \cdot v_j}{\lVert v_i \rVert \lVert v_j \rVert}$$
</center>

Let's explain what the code does:
```
tmm = torch.mm(tensor, tensor.T)
denom = torch.sqrt(tmm.diagonal()).unsqueeze(0)
denom_mat = torch.mm(denom.T, denom)
return torch.nan_to_num(tmm / denom_mat)
```
1. Numerator matrix: Dot product via matrix multiplication

    `tmm = torch.mm(tensor, tensor.T)`

    > This line computes the matrix multiplication of the input `tensor` with its transpose `tensor.T`. The result is a tensor `tmm` of shape $(N, N)$ where each element $(i, j)$ represents the dot product of vectors $i$ and $j$.

2. Denominator values: Norm of each vector

    `denom = torch.sqrt(tmm.diagonal()).unsqueeze(0)`

    > The diagonal of the tensor `tmm` contains the dot products of each vector with itself. Taking the square root of these values gives the magnitude (or norm) of each vector. The `unsqueeze(0)` function is used to add an extra dimension to the tensor, changing its shape from $(N,)$ to $(1, N)$.

3. Denominator matrix

    `denom_mat = torch.mm(denom.T, denom)`

    > This line computes the outer product of the vector `denom` with itself, resulting in a matrix `denom_mat` of shape $(N, N)$. Each element $(i, j)$ of this matrix is the product of the magnitudes of vectors $i$ and $j$.

4. NaN removal

    `return torch.nan_to_num(tmm / denom_mat)`

    > Finally, the cosine similarity between each pair of vectors is calculated by dividing the dot product matrix `tmm` by the matrix `denom_mat`. The division is element-wise, so each element $(i, j)$ of the resulting matrix represents the cosine similarity between vectors $i$ and $j$. `torch.nan_to_num` is used to replace any NaN values that might occur during the division with zeros.

The output is a symmetric matrix where the diagonal elements are all 1 (since the cosine similarity of a vector with itself is always 1), and the off-diagonal elements represent the cosine similarity between different pairs of vectors!

## Benchmarking
Versus naive loops, our approach completely outperforms them by several orders of magnitude. Versus `sklearn.metrics.pairwise.cosine_similarity`, our implementation is 10x faster, and versus a `numpy` implementation using the exact same logic, our PyTorch code is about 2-3x faster.

### Results
```
Result within 1e-8 of scipy loop: True
Result within 1e-8 of numpy loop: True
Result within 1e-8 of torch loop: True
Result within 1e-8 of sklearn: True
Result within 1e-8 of numpy matrix: True
scipy loop:   142362.0 us
numpy loop:   112752.9 us
torch loop:   83144.2 us
sklearn:      401.8 us
numpy matrix: 136.2 us
✨ ours:      48.6 us
```
### Benchmark code

<details closed="true">
<summary>Expand to see the benchmark code used to test the functions.</summary>
```
import torch
import numpy as np
import scipy
from sklearn.metrics.pairwise import cosine_similarity


def torch_loop_cosine_similarity(tensor, output):
    for i in range(len(tensor)):
        for j in range(len(tensor)):
            output[i, j] = torch.cosine_similarity(
                tensor[i].unsqueeze(0), tensor[j].unsqueeze(0)
            )
    return output


def scipy_loop_cosine_similarity(tensor, output):
    for i in range(len(tensor)):
        for j in range(len(tensor)):
            output[i, j] = scipy.spatial.distance.cosine(tensor[i], tensor[j])
    return output


def numpy_loop_cosine_similarity(tensor, output):
    for i in range(len(tensor)):
        for j in range(len(tensor)):
            output[i, j] = float(
                np.dot(tensor[i], tensor[j])
                / (np.linalg.norm(tensor[i]) * np.linalg.norm(tensor[j]))
            )
    return output


def numpy_matrix_cosine_similarity(tensor):
    tmm = np.matmul(tensor, tensor.T)
    denom = np.sqrt(tmm.diagonal()).unsqueeze(0)
    denom_mat = np.matmul(denom.T, denom)
    return np.nan_to_num(tmm / denom_mat)


def torch_matrix_cosine_similarity(tensor):
    tmm = torch.mm(tensor, tensor.T)
    denom = torch.sqrt(tmm.diagonal()).unsqueeze(0)
    denom_mat = torch.mm(denom.T, denom)
    return torch.nan_to_num(tmm / denom_mat)


if __name__ == "__main__":

    # Create a random data tensor of shape (N=50, D=64)
    data = torch.rand((50, 64))

    # Create the output tensor
    zeros = torch.zeros((data.shape[0], data.shape[0]))

    # Compare across different implementations
    sklearn = torch.Tensor(cosine_similarity(data, data))
    npy_matrix = torch.Tensor(numpy_matrix_cosine_similarity(data))
    npy_loop = numpy_loop_cosine_similarity(data, zeros)
    spy_loop = scipy_loop_cosine_similarity(data, zeros)
    torch_loop = torch_loop_cosine_similarity(data, zeros)
    ours = torch_matrix_cosine_similarity(data)

    print(f"Result within 1e-8 of scipy loop: {bool(torch.allclose(ours, spy_loop))}")
    print(f"Result within 1e-8 of numpy loop: {bool(torch.allclose(ours, npy_loop))}")
    print(f"Result within 1e-8 of torch loop: {bool(torch.allclose(ours, torch_loop))}")
    print(f"Result within 1e-8 of sklearn: {bool(torch.allclose(ours, sklearn))}")
    print(
        f"Result within 1e-8 of numpy matrix: {bool(torch.allclose(ours, npy_matrix))}"
    )

    import timeit

    t0 = timeit.Timer(
        stmt="torch_loop_cosine_similarity(data, output)",
        setup="from __main__ import torch_loop_cosine_similarity; import torch; output = torch.zeros((data.shape[0], data.shape[0]));",
        globals={"data": data},
    )

    t1 = timeit.Timer(
        stmt="cosine_similarity(data, data)",
        setup="from __main__ import cosine_similarity",
        globals={"data": data},
    )

    t2 = timeit.Timer(
        stmt="scipy_loop_cosine_similarity(data, output)",
        setup="from __main__ import scipy_loop_cosine_similarity; import torch; output = torch.zeros((data.shape[0], data.shape[0]));",
        globals={"data": data},
    )

    t5 = timeit.Timer(
        stmt="numpy_loop_cosine_similarity(data, output)",
        setup="from __main__ import numpy_loop_cosine_similarity; import torch; output = torch.zeros((data.shape[0], data.shape[0]));",
        globals={"data": data},
    )

    t3 = timeit.Timer(
        stmt="numpy_matrix_cosine_similarity(data)",
        setup="from __main__ import numpy_matrix_cosine_similarity",
        globals={"data": data},
    )

    t4 = timeit.Timer(
        stmt="torch_matrix_cosine_similarity(data)",
        setup="from __main__ import torch_matrix_cosine_similarity",
        globals={"data": data},
    )

    print(f"scipy loop:   {t2.timeit(100) / 100 * 1e6:>5.1f} us")
    print(f"numpy loop:   {t5.timeit(100) / 100 * 1e6:>5.1f} us")
    print(f"torch loop:   {t0.timeit(100) / 100 * 1e6:>5.1f} us")
    print(f"sklearn:      {t1.timeit(100) / 100 * 1e6:>5.1f} us")
    print(f"numpy matrix: {t3.timeit(100) / 100 * 1e6:>5.1f} us")
    print(f"✨ ours:     {t4.timeit(10) / 100 * 1e6:>5.1f} us")
```
</details>4:T1116,When future humans look back at the development of AI, some moments will
stand out as historic.

They'll argue about which moment was more legendary:
the invention of backpropagation! No, it's AlexNet ushering in deep learning.
Who could forget *Transformers is All You Need*? Surely it must be AlphaGo
beating Lee Sedol. Midjourney's #1 discord server. ChatGPT.

But a few fleeting moments - a little less well acknowledged,
a whole lot less significant - will dominate the memories of a few
blessed to have experienced their sheer weirdness.

The short-lived era of DALL·E Mini, later rechristened as Craiyon, is such
a moment. A fugitive golden hour when AI-generated art existed in a beautiful
state of grotesqueness, democratized access, and unbridled experimentation.

<Timeline />

## Just good enough to slap a UI on

DALL·E Mini was an unexpected protagonist in the AI "art" revolution, not
because it was good, but because it was first, free, and functional.

While more sophisticated models remained behind institutional (fire)walls
amidst a period of "too dangerous to release" crisis narratives, artist
Boris Dayma decided to toss a simple text box and a little orange button
on a website, inviting anyone with an internet connection and a minute to
participate in his grand little experiment. Sam Altman would do well to
take a leaf out of Boris's book.

The results were gloriously absurd. Users delighted in prompting the system with
juicy scenarios, waiting a few minutes each time to roll 9 images in its signature
3x3 grid:

<CraiyonExamples />

DALL·E Mini's tendency to produce warped faces, melted hands, and inexplicable artifacts
became features rather than bugs, birthing a cursed aesthetic vocabulary I and many
came to love. The images were so fucking bad they were good.

## Social experimentation

The imperfections in these early models created space for human understanding, meaning-making,
and meme-making.

People used biases present in the models to make jokes about politicians, fictional characters,
and pop culture. Absurdist stonks dominated this meme exchange (when anything is possible, most
things are absurd). 

Every time someone spent a minute only to end up with gross human hands or faces, pure black images,
or horrifying repeated patterns, they built a small bit of intuition for how these things are made.

People quickly figured out tricks, like saying "unreal engine" to boost realism or exploiting glitch
tokens to peek into the model's latent space. These hacks spread fast, fueling further exploration
and vibrant discourse. It felt sort of like the early days of the internet, or going to college with
a bunch of weirdos (in the best way possible).

## Consciously preserving space for the weird and wonderful

Today's image and video generators are already powering early adopters and the next wave of creators.
Flux 1.1 Pro vs. Midjourney v6.1 dominates the conversation today, and the world is better for it.
Progress and commercialization are inevitable and undeniably valuable, and we see clear paths to
productivity across visually creative domains.

The sun set long ago on DALL·E Mini as a cutting-edge research demo. Yet its imperfections reveal
something more truthful than polish ever could. In the pursuit of faster, better, cheaper - find
beauty in the short-lived spaces between.

<div className="flex items-center justify-center">
  <Image src="/duolingo-trail.webp" width={400} height={400} />
</div>

<div className="mt-8 elevated p-4 bg-neutral-800 rounded-lg">
<span className="my-2">
  {"PS: Although Craiyon has long moved on to newer models, the DALL·E Mini experience is immortalized here: "}
  <a href="https://huggingface.co/spaces/dalle-mini/dalle-mini">🤗 DALL·E Mini on HF Spaces</a>{"."}
</span>
</div>

## Further reading

<div className="flex flex-col gap-1">
[Wired - DALL-E Mini Is the Internet's Favorite AI Meme Machine](https://www.wired.com/story/dalle-ai-meme-machine/)
[DALL-E Mini Explained (W&B tech report)](https://wandb.ai/dalle-mini/dalle-mini/reports/DALL-E-Mini-Explained--Vmlldzo4NjIxODA)
[Making Moves in DALL·E Mini](https://thejaymo.net/2022/06/19/250-making-moves-in-dalle-mini/)
[Unpopular opinion: the rise of dalle mini has destroyed chances of this...](https://www.reddit.com/r/dalle2/comments/vbqzbp/unpopular_opinion_the_rise_of_dalle_mini_has/)
</div>0:["7Zr-qunAZlU_ddQ3Hcf6Q",[[["",{"children":["blog",{"children":["__PAGE__",{}]}]},"$undefined","$undefined",true],["",{"children":["blog",{"children":["__PAGE__",{},[["$L1",["$","section",null,{"children":[["$","h1",null,{"className":"font-semibold text-2xl mb-8 tracking-tighter","children":"Blog"}],["$","$L2",null,{"posts":[{"metadata":{"title":"Blazing Fast Pairwise Cosine Similarity","publishedAt":"2021-12-18","tags":["ai"]},"slug":"blazing-fast-pairwise-cosine-similarity","content":"$3"},{"metadata":{"title":"The Golden Hour of Craiyon, or DALL·E Mini","publishedAt":"2025-02-13","tags":["ai"]},"slug":"the-golden-hour-of-craiyon-dalle-mini","content":"$4"}],"tags":["all","ai"]}]]}],null],null],null]},[null,["$","$L5",null,{"parallelRouterKey":"children","segmentPath":["children","blog","children"],"error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L6",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","notFoundStyles":"$undefined"}]],null]},[[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/css/8376597136a899fb.css","precedence":"next","crossOrigin":"$undefined"}],["$","link","1",{"rel":"stylesheet","href":"/_next/static/css/8c26d386e0f6a889.css","precedence":"next","crossOrigin":"$undefined"}]],["$","html",null,{"lang":"en","className":"h-full w-full !cursor-default __className_d65c78","children":["$","body",null,{"className":"antialiased max-w-xl mx-4 mt-8 sm:mx-auto","children":["$","main",null,{"className":"flex-auto min-w-0 mt-6 flex flex-col px-2 md:px-0","children":[["$","aside",null,{"className":"-ml-[8px] mb-16 tracking-tight","children":["$","div",null,{"className":"lg:sticky lg:top-20","children":["$","nav",null,{"className":"flex flex-row items-start relative px-0 pb-0 fade md:overflow-auto scroll-pr-6 md:relative","id":"nav","children":["$","div",null,{"className":"flex flex-row space-x-0 pr-10","children":[["$","$L7","/",{"href":"/","className":"transition-all hover:text-neutral-800 dark:hover:text-neutral-200 flex align-middle relative py-1 px-2 m-1","children":"about"}],["$","$L7","/blog",{"href":"/blog","className":"transition-all hover:text-neutral-800 dark:hover:text-neutral-200 flex align-middle relative py-1 px-2 m-1","children":"blog"}]]}]}]}]}],["$","$L5",null,{"parallelRouterKey":"children","segmentPath":["children"],"error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L6",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":["$","section",null,{"children":[["$","h1",null,{"className":"mb-8 text-2xl font-semibold tracking-tighter","children":"404 - Page Not Found"}],["$","p",null,{"className":"mb-4","children":"The page you are looking for does not exist."}]]}],"notFoundStyles":[]}],["$","footer",null,{"className":"mb-16","children":["$","p",null,{"className":"mt-8 text-neutral-600 dark:text-neutral-600","children":["© ",2025," Joel Huang"]}]}]]}]}]}]],null],null],["$L8",null]]]]
8:[["$","meta","0",{"name":"viewport","content":"width=device-width, initial-scale=1"}],["$","meta","1",{"charSet":"utf-8"}],["$","title","2",{"children":"Joel Huang"}],["$","meta","3",{"name":"description","content":"Joel Huang"}],["$","meta","4",{"name":"robots","content":"index, follow"}],["$","meta","5",{"name":"googlebot","content":"index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1"}],["$","meta","6",{"property":"og:title","content":"Joel Huang"}],["$","meta","7",{"property":"og:description","content":"Joel Huang"}],["$","meta","8",{"property":"og:url","content":"https://joelhuang.dev"}],["$","meta","9",{"property":"og:site_name","content":"Joel Huang"}],["$","meta","10",{"property":"og:locale","content":"en_US"}],["$","meta","11",{"property":"og:type","content":"website"}],["$","meta","12",{"name":"twitter:card","content":"summary"}],["$","meta","13",{"name":"twitter:title","content":"Joel Huang"}],["$","meta","14",{"name":"twitter:description","content":"Joel Huang"}],["$","link","15",{"rel":"icon","href":"/icon.ico?76fc8b9a30e3efac","type":"image/x-icon","sizes":"16x16"}],["$","meta","16",{"name":"next-size-adjust"}]]
1:null
