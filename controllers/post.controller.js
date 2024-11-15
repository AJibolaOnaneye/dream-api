import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";

export const getPosts = async (req, res) => {
  const query = req.query;

  try {
    const posts = await prisma.post.findMany({
      where: {
        city: query.city || undefined,
        type: query.type || undefined,
        property: query.property || undefined,
        bedroom: isNaN(parseInt(query.bedroom)) ? undefined : parseInt(query.bedroom),
        price: {
          gte: isNaN(parseInt(query.minPrice)) ? undefined : parseInt(query.minPrice),
          lte: isNaN(parseInt(query.maxPrice)) ? undefined : parseInt(query.maxPrice),
        },
      },
    });

    res.status(200).json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get posts" });
  }
};

export const getPost = async (req, res) => {
  const id = req.params.id;
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        postDetail: true,
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
      },
    });

    const token = req.cookies?.token;

    if (token) {
      jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
        if (err) {
          return res.status(401).json({ message: "Unauthorized access" });
        }
        
        const saved = await prisma.savedPost.findUnique({
          where: {
            userId_postId: {
              postId: id,
              userId: payload.id,
            },
          },
        });
        return res.status(200).json({ ...post, isSaved: saved ? true : false });
      });
    } else {
      return res.status(200).json({ ...post, isSaved: false });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get post" });
  }
};

export const addPost = async (req, res) => {
  const body = req.body;
  const tokenUserId = req.userId;

  if (!tokenUserId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const newPost = await prisma.post.create({
      data: {
        ...body.postData,
        userId: tokenUserId,
        postDetail: {
          create: body.postDetail,
        },
      },
    });
    res.status(200).json(newPost);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create post" });
  }
};

export const updatePost = async (req, res) => {
  const { id } = req.params;
  const body = req.body;
  const tokenUserId = req.userId;

  if (!tokenUserId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId !== tokenUserId) {
      return res.status(403).json({ message: "Not Authorized" });
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        ...body.postData,
        postDetail: {
          update: body.postDetail,
        },
      },
    });

    res.status(200).json(updatedPost);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to update post" });
  }
};

export const deletePost = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  if (!tokenUserId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId !== tokenUserId) {
      return res.status(403).json({ message: "Not Authorized!" });
    }

    await prisma.post.delete({
      where: { id },
    });

    res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete post" });
  }
};



// revised code below

// import prisma from "../lib/prisma.js";
// import jwt from "jsonwebtoken";

// // Get posts with optional filters
// export const getPosts = async (req, res) => {
//   const query = req.query;

//   try {
//     const posts = await prisma.post.findMany({
//       where: {
//         city: query.city || undefined,
//         type: query.type || undefined,
//         property: query.property || undefined,
//         bedroom: isNaN(parseInt(query.bedroom)) ? undefined : parseInt(query.bedroom),
//         price: {
//           gte: isNaN(parseInt(query.minPrice)) ? undefined : parseInt(query.minPrice),
//           lte: isNaN(parseInt(query.maxPrice)) ? undefined : parseInt(query.maxPrice),
//         },
//       },
//     });

//     res.status(200).json(posts);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to get posts" });
//   }
// };

// // Get a specific post by ID with additional details
// export const getPost = async (req, res) => {
//   const id = req.params.id;

//   try {
//     const post = await prisma.post.findUnique({
//       where: { id },
//       include: {
//         postDetail: true,
//         user: {
//           select: {
//             username: true,
//             avatar: true,
//           },
//         },
//       },
//     });

//     if (!post) {
//       return res.status(404).json({ message: "Post not found" });
//     }

//     const token = req.cookies?.token;

//     if (token) {
//       jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
//         if (err) {
//           return res.status(401).json({ message: "Unauthorized access" });
//         }
        
//         const saved = await prisma.savedPost.findUnique({
//           where: {
//             userId_postId: {
//               postId: id,
//               userId: payload.id,
//             },
//           },
//         });
//         return res.status(200).json({ ...post, isSaved: !!saved });
//       });
//     } else {
//       return res.status(200).json({ ...post, isSaved: false });
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to get post" });
//   }
// };

// // Add a new post
// export const addPost = async (req, res) => {
//   const body = req.body;
//   const tokenUserId = req.userId;

//   if (!tokenUserId) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }

//   try {
//     const newPost = await prisma.post.create({
//       data: {
//         ...body.postData,
//         userId: tokenUserId,
//         postDetail: {
//           create: body.postDetail,
//         },
//       },
//     });
//     res.status(200).json(newPost);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to create post" });
//   }
// };

// // Update an existing post by ID
// export const updatePost = async (req, res) => {
//   const { id } = req.params;
//   const body = req.body;
//   const tokenUserId = req.userId;

//   if (!tokenUserId) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }

//   try {
//     const post = await prisma.post.findUnique({
//       where: { id },
//     });

//     if (!post) {
//       return res.status(404).json({ message: "Post not found" });
//     }

//     if (post.userId !== tokenUserId) {
//       return res.status(403).json({ message: "Not Authorized" });
//     }

//     const updatedPost = await prisma.post.update({
//       where: { id },
//       data: {
//         ...body.postData,
//         postDetail: {
//           update: body.postDetail,
//         },
//       },
//     });

//     res.status(200).json(updatedPost);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to update post" });
//   }
// };

// // Delete a post by ID
// export const deletePost = async (req, res) => {
//   const id = req.params.id;
//   const tokenUserId = req.userId;

//   if (!tokenUserId) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }

//   try {
//     const post = await prisma.post.findUnique({
//       where: { id },
//     });

//     if (!post) {
//       return res.status(404).json({ message: "Post not found" });
//     }

//     if (post.userId !== tokenUserId) {
//       return res.status(403).json({ message: "Not Authorized!" });
//     }

//     await prisma.post.delete({
//       where: { id },
//     });

//     res.status(200).json({ message: "Post deleted" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to delete post" });
//   }
// };
