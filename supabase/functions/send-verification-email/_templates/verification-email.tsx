import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'https://esm.sh/@react-email/components@0.0.22'
import * as React from 'https://esm.sh/react@18.3.1'

interface VerificationEmailProps {
  supabase_url: string
  email_action_type: string
  redirect_to: string
  token_hash: string
  token: string
}

export const VerificationEmail = ({
  token,
  supabase_url,
  email_action_type,
  redirect_to,
  token_hash,
}: VerificationEmailProps) => (
  <Html>
    <Head />
    <Preview>Verify your email for PaperVault</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to PaperVault!</Heading>
        <Text style={text}>
          Thank you for signing up. Please verify your email address by clicking the button below:
        </Text>
        <Link
          href={`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
          target="_blank"
          style={button}
        >
          Verify Email Address
        </Link>
        <Text style={{ ...text, marginTop: '24px', marginBottom: '14px' }}>
          Or, copy and paste this verification code:
        </Text>
        <code style={code}>{token}</code>
        <Text
          style={{
            ...text,
            color: '#ababab',
            marginTop: '24px',
            marginBottom: '16px',
          }}
        >
          If you didn&apos;t create an account, you can safely ignore this email.
        </Text>
        <Text style={footer}>
          PaperVault - Your Academic Paper Repository
        </Text>
      </Container>
    </Body>
  </Html>
)

export default VerificationEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  borderRadius: '8px',
  maxWidth: '560px',
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 24px',
  padding: '0',
  textAlign: 'center' as const,
}

const text = {
  color: '#4a4a4a',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const button = {
  backgroundColor: '#6366f1',
  borderRadius: '8px',
  color: '#ffffff',
  display: 'block',
  fontSize: '16px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  textDecoration: 'none',
  padding: '14px 24px',
  margin: '24px auto',
  width: 'fit-content',
}

const code = {
  display: 'block',
  padding: '16px',
  backgroundColor: '#f4f4f4',
  borderRadius: '8px',
  border: '1px solid #e0e0e0',
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  letterSpacing: '4px',
}

const footer = {
  color: '#898989',
  fontSize: '12px',
  lineHeight: '22px',
  marginTop: '32px',
  textAlign: 'center' as const,
}
