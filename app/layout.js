import './globals.css';

export const metadata = {
  title: 'Agiliza',
  description: 'Sistema web para unificação de serviços e vendas.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}