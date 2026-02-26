const Landing = () => {
  return (
    <div className="font-sans text-gray-800">
      {/* --- HERO SECTION --- */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6 tracking-tight">
                Temukan Komunitas & Event Seru di LetsMeet
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl leading-relaxed">
                Platform terbaik untuk mencari teman baru, hobi baru, dan
                pengalaman yang tak terlupakan.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  Cari Event
                </button>
                <button className="bg-white hover:bg-gray-50 text-blue-600 border border-blue-200 font-semibold py-3 px-8 rounded-full shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                  Pelajari Lebih Lanjut
                </button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center w-full">
              {/* Kamu bisa ganti src dengan gambar aslinya nanti */}
              <img
                src="https://via.placeholder.com/600x400"
                alt="Hero"
                className="w-full max-w-lg h-auto rounded-2xl shadow-2xl object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Kenapa Memilih <span className="text-blue-600">LetsMeet?</span>
            </h2>
            <p className="text-lg text-gray-500">
              Kemudahan dalam satu aplikasi untuk memperluas jangkauan sosialmu.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 px-4">
            {/* Feature 1 */}
            <div className="bg-gray-50 rounded-2xl p-8 text-center shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="text-5xl mb-6">📅</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Event Terkurasi
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Semua event yang ada di platform kami sudah melalui tahap
                verifikasi.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="bg-gray-50 rounded-2xl p-8 text-center shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="text-5xl mb-6">🤝</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Koneksi Luas
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Bangun jaringan pertemanan dengan orang-orang yang memiliki
                minat yang sama.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="bg-gray-50 rounded-2xl p-8 text-center shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="text-5xl mb-6">🚀</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Mudah & Cepat
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Daftar event hanya dengan satu klik tanpa ribet administrasi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- CALL TO ACTION --- */}
      <section className="bg-blue-600 text-white py-20 text-center px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">
            Siap untuk Mulai Berkenalan?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Gabung dengan ribuan pengguna lainnya sekarang juga dan mulai
            perjalanan barumu.
          </p>
          <button className="bg-white text-blue-700 hover:bg-gray-50 hover:text-blue-800 font-bold py-4 px-10 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-lg">
            Daftar Sekarang
          </button>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-gray-900 py-10 text-center border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-gray-400 mb-0 font-medium">
            &copy; 2024 LetsMeet Indonesia. Semua Hak Dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
