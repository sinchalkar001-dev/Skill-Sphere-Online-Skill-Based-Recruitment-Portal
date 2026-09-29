import Header from './Header';
import Footer from './Footer';

const PageLayout = ({ children, showFooter = true }) => {
  return (
    <div className="min-h-screen flex flex-col bg-surface-950">
      <Header />
      <main className="flex-1">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
};

export default PageLayout;
