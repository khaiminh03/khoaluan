import { assets } from "../assets/assets";
const Footer = () => {
    const linkSections = [
        {
            title: "Liên kết nhanh",
            links: ["Trang chủ", "Bán chạy"]
        },
        {
            title: "Cần trợ giúp?",
            links: ["Hotline: 0868475756", "Email:khaiminhdayne03@gmail.com"]
        },
        {
            title: "Theo dõi",
            links: ["Instagram", "Facebook", "YouTube"]
        }
    ];

    return (
        <div className="px-6 md:px-16 lg:px-24 xl:px-32 mt-24 bg-red">
            <div className="flex flex-col md:flex-row items-start justify-between gap-10 py-10 border-b border-gray-500/30 text-gray-500">
                <div>
                    <img className="w-34 md:w-32" src={assets.logoe} alt="dummyLogoColored" />
                    <p className="max-w-[410px] mt-6">Nền tảng thương mại điện tử AgriEcom là cầu nối giữa người nông dân Trà Vinh và người tiêu dùng trên toàn quốc. Chúng tôi cam kết cung cấp các sản phẩm nông sản tươi - sạch.</p>
                </div>
                <div className="flex flex-wrap justify-between w-full md:w-[45%] gap-5">
                    {linkSections.map((section, index) => (
                        <div key={index}>
                            <h3 className="font-semibold text-base text-gray-900 md:mb-5 mb-2">{section.title}</h3>
                            <ul className="text-sm space-y-1">
                                {section.links.map((link, i) => (
                                    <li key={i}>
                                        <a href="#" className="hover:underline transition">{link}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
            <p className="py-4 text-center text-sm md:text-base text-gray-500/80">
                Copyright 2025 © khaiminh
            </p>
        </div>
    );
};
export default Footer