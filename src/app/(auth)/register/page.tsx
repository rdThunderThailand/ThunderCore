import RegisterClient from "@/features/auth/register/RegisterClient"

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function RegisterPage(props: PageProps) {
  const searchParams = await props.searchParams
  const email = typeof searchParams.email === 'string' ? searchParams.email : undefined

  return <RegisterClient initialEmail={email} />
}
