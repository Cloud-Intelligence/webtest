import { Button } from "@/components/ui/button"

export default function HeroButton() {
  const handleClick = () => {
    // Scroll to contact section
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Button 
      onClick={handleClick}
      className="bg-white/15 backdrop-blur-md border-white/20 text-white hover:bg-white/25 hover:border-white/30 px-8 py-3 rounded-full font-inter font-medium text-sm transition-all duration-300 hover:scale-105 shadow-lg"
      style={{
        boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.08), 0px 1px 4px rgba(0, 0, 0, 0.04), inset 0px 1px 0px rgba(255, 255, 255, 0.3)'
      }}
    >
      Explore our Solutions
    </Button>
  )
}