import React from "react";
import "./index.scss";
import uon1 from "../../../assets/imageHome/Service/uon-1.jpg";
import uon2 from "../../../assets/imageHome/Service/uon-2.jpg";
import uon3 from "../../../assets/imageHome/Service/uon-3.jpg";

const HairServices = () => {
  const services = [
    {
      title: "Cắt tóc",
      image: uon1,
      price: null,
      link: "#",
    },
    {
      title: "Uốn định hình",
      image: uon2,
      price: "379.000đ",
      link: "#",
    },
    {
      title: "Thay đổi màu tóc",
      image: uon3,
      price: "199.000đ",
      link: "#",
    },
  ];

  return (
    <div className="hair-services">
      <h2 className="hair-services__title">DỊCH VỤ TÓC</h2>
      <div className="hair-services__grid">
        {services.map((service, index) => (
          <div key={index} className="hair-services__card">
            <img
              src={service.image}
              alt={service.title}
              className="hair-services__image"
            />
            <h3 className="hair-services__card-title">{service.title}</h3>
            {service.price && (
              <p className="hair-services__price">Giá từ {service.price}</p>
            )}
            <a href={service.link} className="hair-services__link">
              Tìm hiểu thêm &gt;
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HairServices;