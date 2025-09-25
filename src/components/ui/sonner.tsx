import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:plasmo-bg-white group-[.toaster]:plasmo-text-gray-900 group-[.toaster]:plasmo-border-gray-200 group-[.toaster]:plasmo-shadow-lg",
          description: "group-[.toast]:plasmo-text-gray-500",
          actionButton:
            "group-[.toast]:plasmo-bg-blue-500 group-[.toast]:plasmo-text-white",
          cancelButton:
            "group-[.toast]:plasmo-bg-gray-100 group-[.toast]:plasmo-text-gray-700"
        }
      }}
      {...props}
    />
  )
}

export { Toaster }