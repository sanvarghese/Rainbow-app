"use client";

import React from "react";
import Image from "next/image";
import "../Blog/blog.css";
import blogbanner from "../../../assets/images/blogbanner.png"
import honeyimg from "../../../assets/images/honeyimg.jpg";

const dummyPosts = [
  {
    image: honeyimg,
    title: "Mazhavillu products",
    description: "mazhavillu organic e-commerce website .............",
    date: "April 12, 2025",
    readTime: "3 min read",
    tag: "MAZHAVILLU",
  },
  {
    image: honeyimg,
    title: "Mazhavillu products",
    description: "mazhavillu organic e-commerce website .............",
    date: "April 12, 2025",
    readTime: "4 min read",
    tag: "MAZHAVILLU",
  },
  {
    image: honeyimg,
    title: "Mazhavillu products",
    description: "mazhavillu organic e-commerce website .............",
    date: "April 12, 2025",
    readTime: "5 min read",
    tag: "MAZHAVILLU",
  },
  {
    image: honeyimg,
    title: "Mazhavillu products",
    description: "mazhavillu organic e-commerce website .............",
    date: "April 12, 2025",
    readTime: "5 min read",
    tag: "MAZHAVILLU",
  },
  {
    image: honeyimg,
    title: "Mazhavillu products",
    description: "mazhavillu organic e-commerce website .............",
    date: "April 12, 2025",
    readTime: "5 min read",
    tag: "MAZHAVILLU",
  },
  {
    image: honeyimg,
    title: "Mazhavillu products",
    description: "mazhavillu organic e-commerce website .............",
    date: "April 12, 2025",
    readTime: "5 min read",
    tag: "MAZHAVILLU",
  },
  {
    image: honeyimg,
    title: "Mazhavillu products",
    description: "mazhavillu organic e-commerce website .............",
    date: "April 12, 2025",
    readTime: "5 min read",
    tag: "MAZHAVILLU",
  },
  {
    image: honeyimg,
    title: "Mazhavillu products",
    description: "mazhavillu organic e-commerce website .............",
    date: "April 12, 2025",
    readTime: "5 min read",
    tag: "MAZHAVILLU",
  },
  {
    image: honeyimg,
    title: "Mazhavillu products",
    description: "mazhavillu organic e-commerce website .............",
    date: "April 12, 2025",
    readTime: "5 min read",
    tag: "MAZHAVILLU",
  },
];

const BlogPage = () => {
  return (
    <div className="mb-5">
      {/* Blog Banner */}
      <div className="container-fluid blogcontainer position-relative d-flex justify-content-center">
        <Image
          className="blogbanner"
          src={blogbanner}
          alt="blogbanner"
          priority
        />

        <div className="position-absolute top-50 start-50 translate-middle text-center">
          <h2 className="blogtext mb-4">
            <b>Blog</b>
          </h2>
        </div>
      </div>

      {/* Blog Categories */}
      <div className="categorytext">
        <div className="d-flex flex-wrap justify-content-center gap-2">
          <button className="btn btn-outline categorybtn">Drinks</button>
          <button className="btn btn-outline categorybtn">Foods</button>
          <button className="btn btn-outline categorybtn">Veg</button>
        </div>
        <div className="d-flex flex-wrap justify-content-center gap-2 mt-2">
          <button className="btn btn-outline categorybtn">Special stories</button>
          <button className="btn btn-outline categorybtn">Most Popular</button>
          <button className="btn btn-outline categorybtn">Latest blogs</button>
          <button className="btn btn-outline categorybtn">About Products</button>
        </div>
      </div>

      {/* Blog Posts */}
      <div className="container-fluid d-flex justify-content-center blogareacontainer">
        <div className="blogcontentbtnrow d-flex justify-content-end align-items-center mb-2 mt-3">
          <button className="btn btn-outline-secondary blogbtn">
            Read All
          </button>
        </div>

        <div className="row pb-5">
          {dummyPosts.map((post, index) => (
            <div className="col-lg-4 col-md-6 mb-4" key={index}>
              <div className="card blogareacard h-100">
                <Image
                  src={post.image}
                  className="cardimgtop"
                  alt="Blogimg"
                />
                <div className="card-body blogcardcontent d-flex flex-column">
                  <span className="text-uppercase text-success small fw-bold mb-2">
                    {post.tag}
                  </span>
                  <h5 className="card-title blogcardtitle">{post.title}</h5>
                  <p className="card-text blogcardtext">{post.description}</p>
                  <p className="text-muted small mt-auto blogcardmutedtext">
                    {post.date} • {post.readTime}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
