const Letter = () => {
    
    return (
        <div className="flex flex-col items-center justify-center text-center space-y-2 mt-24 pb-14">
            <h1 className="md:text-4xl text-2xl font-semibold">Không bao giờ bỏ lỡ các ưu đãi!</h1>
            <p className="md:text-lg text-gray-500/70 pb-8">
            Đăng ký để nhận các ưu đãi mới nhất, sản phẩm mới và giảm giá độc quyền
            </p>
            <form className="flex items-center justify-between max-w-2xl w-full md:h-13 h-12">
                <input
                    className="border border-gray-300 rounded-md h-full border-r-0 outline-none w-full rounded-r-none px-3 text-gray-500"
                    type="text"
                    placeholder="Enter your email id"
                    required
                />
                <button type="submit" className="md:px-12 px-8 h-full text-white bg-primary hover:bg-dull transition-all cursor-pointer rounded-md rounded-l-none">
                    Gửi 
                </button>
            </form>
        </div>
    )
}
export default Letter