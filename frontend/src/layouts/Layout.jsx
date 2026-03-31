import Navbar from "./Navbar";

const Layout = ({ children }) => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        background: "var(--color-bg-dark)"
      }}
    >
      <Navbar />

      <main
        style={{
          flex: 1,
          paddingTop: "72px",
          width: "100%"
        }}
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;