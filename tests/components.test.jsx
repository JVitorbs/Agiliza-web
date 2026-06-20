import { render, screen, fireEvent } from "@testing-library/react"
import { Badge } from "@/app/components/ui/badge"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/app/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/components/ui/tabs"

describe("Badge", () => {
  it("renders with text", () => {
    render(<Badge>Ativo</Badge>)
    expect(screen.getByText("Ativo")).toBeInTheDocument()
  })

  it("applies default variant classes", () => {
    const { container } = render(<Badge>Default</Badge>)
    expect(container.firstChild).toHaveClass("bg-indigo-500/20")
  })

  it("applies secondary variant classes", () => {
    const { container } = render(<Badge variant="secondary">Secondary</Badge>)
    expect(container.firstChild).toHaveClass("bg-secondary")
  })

  it("applies destructive variant classes", () => {
    const { container } = render(<Badge variant="destructive">Erro</Badge>)
    expect(container.firstChild).toHaveClass("bg-red-500/20")
  })

  it("applies success variant classes", () => {
    const { container } = render(<Badge variant="success">Sucesso</Badge>)
    expect(container.firstChild).toHaveClass("bg-green-500/20")
  })

  it("applies warning variant classes", () => {
    const { container } = render(<Badge variant="warning">Atenção</Badge>)
    expect(container.firstChild).toHaveClass("bg-yellow-500/20")
  })

  it("applies outline variant classes", () => {
    const { container } = render(<Badge variant="outline">Outlined</Badge>)
    expect(container.firstChild).toHaveClass("border-border")
  })

  it("accepts additional className", () => {
    const { container } = render(<Badge className="extra-class">Custom</Badge>)
    expect(container.firstChild).toHaveClass("extra-class")
  })
})

describe("Button", () => {
  it("renders with text", () => {
    render(<Button>Salvar</Button>)
    expect(screen.getByText("Salvar")).toBeInTheDocument()
  })

  it("renders as button element by default", () => {
    const { container } = render(<Button>Click</Button>)
    expect(container.firstChild.tagName).toBe("BUTTON")
  })

  it("applies default variant classes", () => {
    const { container } = render(<Button>Default</Button>)
    expect(container.firstChild).toHaveClass("bg-indigo-500")
  })

  it("applies destructive variant classes", () => {
    const { container } = render(<Button variant="destructive">Excluir</Button>)
    expect(container.firstChild).toHaveClass("bg-red-500")
  })

  it("applies outline variant classes", () => {
    const { container } = render(<Button variant="outline">Outline</Button>)
    expect(container.firstChild).toHaveClass("border-border")
  })

  it("applies secondary variant classes", () => {
    const { container } = render(<Button variant="secondary">Secundário</Button>)
    expect(container.firstChild).toHaveClass("bg-secondary")
  })

  it("applies ghost variant classes", () => {
    const { container } = render(<Button variant="ghost">Ghost</Button>)
    expect(container.firstChild).toHaveClass("text-muted-foreground")
  })

  it("applies link variant classes", () => {
    const { container } = render(<Button variant="link">Link</Button>)
    expect(container.firstChild).toHaveClass("text-indigo-400")
  })

  it("applies sm size classes", () => {
    const { container } = render(<Button size="sm">Small</Button>)
    expect(container.firstChild).toHaveClass("h-8")
  })

  it("applies lg size classes", () => {
    const { container } = render(<Button size="lg">Large</Button>)
    expect(container.firstChild).toHaveClass("h-12")
  })

  it("applies icon size classes", () => {
    const { container } = render(<Button size="icon">+</Button>)
    expect(container.firstChild).toHaveClass("w-9")
  })

  it("disables button", () => {
    render(<Button disabled>Desabilitado</Button>)
    expect(screen.getByText("Desabilitado")).toBeDisabled()
  })

  it("fires onClick handler", () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    fireEvent.click(screen.getByText("Click"))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it("accepts additional className", () => {
    const { container } = render(<Button className="extra-btn">Custom</Button>)
    expect(container.firstChild).toHaveClass("extra-btn")
  })
})

describe("Input", () => {
  it("renders input element", () => {
    const { container } = render(<Input />)
    expect(container.firstChild.tagName).toBe("INPUT")
  })

  it("passes type prop", () => {
    render(<Input type="email" data-testid="input" />)
    expect(screen.getByTestId("input")).toHaveAttribute("type", "email")
  })

  it("passes placeholder prop", () => {
    render(<Input placeholder="Digite seu nome" />)
    expect(screen.getByPlaceholderText("Digite seu nome")).toBeInTheDocument()
  })

  it("disables input", () => {
    render(<Input disabled data-testid="input" />)
    expect(screen.getByTestId("input")).toBeDisabled()
  })

  it("accepts additional className", () => {
    const { container } = render(<Input className="extra-input" />)
    expect(container.firstChild).toHaveClass("extra-input")
  })

  it("fires onChange handler", () => {
    const handleChange = vi.fn()
    render(<Input onChange={handleChange} data-testid="input" />)
    fireEvent.change(screen.getByTestId("input"), { target: { value: "teste" } })
    expect(handleChange).toHaveBeenCalled()
  })
})

describe("Card", () => {
  function renderCard() {
    return render(
      <Card>
        <CardHeader>
          <CardTitle>Título</CardTitle>
          <CardDescription>Descrição</CardDescription>
        </CardHeader>
        <CardContent>Conteúdo</CardContent>
        <CardFooter>Rodapé</CardFooter>
      </Card>
    )
  }

  it("renders all card parts", () => {
    renderCard()
    expect(screen.getByText("Título")).toBeInTheDocument()
    expect(screen.getByText("Descrição")).toBeInTheDocument()
    expect(screen.getByText("Conteúdo")).toBeInTheDocument()
    expect(screen.getByText("Rodapé")).toBeInTheDocument()
  })

  it("card has base classes", () => {
    const { container } = render(<Card />)
    expect(container.firstChild).toHaveClass("rounded-xl")
    expect(container.firstChild).toHaveClass("bg-card")
  })

  it("card header has spacing classes", () => {
    const { container } = render(<CardHeader />)
    expect(container.firstChild).toHaveClass("flex-col")
    expect(container.firstChild).toHaveClass("p-5")
  })

  it("card content has padding classes", () => {
    const { container } = render(<CardContent />)
    expect(container.firstChild).toHaveClass("pt-0")
  })
})

describe("Tabs", () => {
  it("renders tabs and shows active content", () => {
    render(
      <Tabs value="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Aba 1</TabsTrigger>
          <TabsTrigger value="tab2">Aba 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Conteúdo 1</TabsContent>
        <TabsContent value="tab2">Conteúdo 2</TabsContent>
      </Tabs>
    )

    expect(screen.getByText("Conteúdo 1")).toBeInTheDocument()
    expect(screen.queryByText("Conteúdo 2")).not.toBeInTheDocument()
  })

  it("switches content on tab click", () => {
    const onValueChange = vi.fn()

    render(
      <Tabs value="tab1" onValueChange={onValueChange}>
        <TabsList>
          <TabsTrigger value="tab1">Aba 1</TabsTrigger>
          <TabsTrigger value="tab2">Aba 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Conteúdo 1</TabsContent>
        <TabsContent value="tab2">Conteúdo 2</TabsContent>
      </Tabs>
    )

    fireEvent.click(screen.getByText("Aba 2"))
    expect(onValueChange).toHaveBeenCalledWith("tab2")
  })

  it("marks active trigger with aria-selected", () => {
    render(
      <Tabs value="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Aba 1</TabsTrigger>
          <TabsTrigger value="tab2">Aba 2</TabsTrigger>
        </TabsList>
      </Tabs>
    )

    expect(screen.getByText("Aba 1").closest("button")).toHaveAttribute("aria-selected", "true")
    expect(screen.getByText("Aba 2").closest("button")).toHaveAttribute("aria-selected", "false")
  })

  it("renders TabsList with tablist role", () => {
    const { container } = render(
      <Tabs value="a">
        <TabsList />
      </Tabs>
    )
    expect(container.querySelector('[role="tablist"]')).toBeInTheDocument()
  })

  it("TabsContent has tabpanel role", () => {
    const { container } = render(
      <Tabs value="x">
        <TabsContent value="x" />
      </Tabs>
    )
    expect(container.querySelector('[role="tabpanel"]')).toBeInTheDocument()
  })
})
