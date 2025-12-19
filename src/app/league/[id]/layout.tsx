type LayoutProps = {
  children: React.ReactNode;
  modal: React.ReactNode;
};

export default function LeagueLayout({ children, modal }: LayoutProps) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
