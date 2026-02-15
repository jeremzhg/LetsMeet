import { Container, Row, Col, Button, Card } from "react-bootstrap";

const Landing = () => {
  return (
    <div>
      <section className="bg-light py-5">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <h1 className="display-4 fw-bold">
                Temukan Komunitas & Event Seru di LetsMeet
              </h1>
              <p className="lead">
                Platform terbaik untuk mencari teman baru, hobi baru, dan
                pengalaman yang tak terlupakan.
              </p>
              <div className="d-flex gap-3">
                <Button variant="primary" size="lg">
                  Cari Event
                </Button>
                <Button variant="outline-primary" size="lg">
                  Pelajari Lebih Lanjut
                </Button>
              </div>
            </Col>
            <Col md={6} className="text-center">
              {/* Kamu bisa ganti src dengan gambar aslinya nanti */}
              <img
                src="https://via.placeholder.com/500x400"
                alt="Hero"
                className="img-fluid rounded shadow"
              />
            </Col>
          </Row>
        </Container>
      </section>
      {/* --- FEATURES SECTION --- */}
      <section className="py-5">
        <Container>
          <div className="text-center mb-5">
            <h2 className="fw-bold">Kenapa Memilih LetsMeet?</h2>
            <p className="text-muted">Kemudahan dalam satu aplikasi.</p>
          </div>
          <Row>
            {/* Feature 1 */}
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm text-center p-3">
                <Card.Body>
                  <div className="fs-1 mb-3">📅</div>
                  <Card.Title className="fw-bold">Event Terkurasi</Card.Title>
                  <Card.Text>
                    Semua event yang ada di platform kami sudah melalui tahap
                    verifikasi.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            {/* Feature 2 */}
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm text-center p-3">
                <Card.Body>
                  <div className="fs-1 mb-3">🤝</div>
                  <Card.Title className="fw-bold">Koneksi Luas</Card.Title>
                  <Card.Text>
                    Bangun jaringan pertemanan dengan orang-orang yang memiliki
                    minat yang sama.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            {/* Feature 3 */}
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm text-center p-3">
                <Card.Body>
                  <div className="fs-1 mb-3">🚀</div>
                  <Card.Title className="fw-bold">Mudah & Cepat</Card.Title>
                  <Card.Text>
                    Daftar event hanya dengan satu klik tanpa ribet
                    administrasi.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
      {/* --- CALL TO ACTION --- */}
      <section className="bg-primary text-white py-5 text-center">
        <Container>
          <h2 className="fw-bold mb-4">Siap untuk Mulai Berkenalan?</h2>
          <p className="mb-4 opacity-75">
            Gabung dengan ribuan pengguna lainnya sekarang juga.
          </p>
          <Button variant="light" size="lg" className="fw-bold text-primary">
            Daftar Sekarang
          </Button>
        </Container>
      </section>
      {/* --- FOOTER --- */}
      <footer className="py-4 text-center border-top">
        <p className="text-muted mb-0">
          &copy; 2024 LetsMeet Indonesia. Semua Hak Dilindungi.
        </p>
      </footer>
    </div>
  );
};

export default Landing;
