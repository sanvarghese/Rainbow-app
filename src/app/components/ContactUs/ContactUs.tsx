"use client";

import React, { useState } from "react";
import Image from "next/image";

import "../ContactUs/contactus.css";

import contactus_bg from "../../../assets/images/contactus_bg.png";
import contactphone from "../../../assets/images/contactphone.png";
import contactmail from "../../../assets/images/contactmail.png";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Please Enter Your Name";
    if (!formData.email.trim()) {
      newErrors.email = "Please Enter Your Email";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.phone.trim()) newErrors.phone = "Please Enter Your Phone Number";
    if (!formData.subject.trim()) newErrors.subject = "Please Enter a Subject";
    if (!formData.message.trim()) newErrors.message = "Please Enter a Message";

    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      console.log("Form submitted:", formData);
      alert("Thank you! Your message has been sent.");

      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    }
  };

  return (
    <section className="contactsection mt-5">
      <div className="container-fluid contactuscontainer">
        <div className="contactus_bg d-flex justify-content-center">
          <Image className="contactusbg" src={contactus_bg} alt="Contact Us Background" />
        </div>
        <Image className="contactphone" src={contactphone} alt="Contact Phone" />
        <Image className="contactmail" src={contactmail} alt="Contact Mail" />
      </div>

      <div className="contactform-wrapper">
        <h2 className="form-title contactformcontactus">Contact us</h2>
        <p className="form-subtitle contactformsubtitle">
          Fill out the form below, and we’ll get back to you as soon as possible!
        </p>
        <form className="contact-form contactusform" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && <span className="error">{errors.name}</span>}
            </div>
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email Id"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
              />
              {errors.phone && <span className="error">{errors.phone}</span>}
            </div>
            <div className="form-group">
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={formData.subject}
                onChange={handleChange}
              />
              {errors.subject && <span className="error">{errors.subject}</span>}
            </div>
          </div>
          <div className="form-group">
            <textarea
              name="message"
              placeholder="Message"
              rows={5}
              value={formData.message}
              onChange={handleChange}
            ></textarea>
            {errors.message && <span className="error">{errors.message}</span>}
          </div>
          <button type="submit">Submit</button>
        </form>
      </div>
    </section>
  );
};

export default ContactUs;
