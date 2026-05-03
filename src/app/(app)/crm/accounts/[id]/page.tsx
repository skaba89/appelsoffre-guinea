import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Building2, Globe, Mail, Phone, MapPin, Edit, Trash2, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'

interface Contact { id: string; firstName: string; lastName: string; email: string | null; phone: string | null; position: string | null }
interface Account { id: string; name: string; industry: string | null; website: string | null; phone: string | null; email: string | null; address: string | null; description: string | null; createdAt: string; contacts: Contact[] }

async function getAccount(id: string): Promise<Account | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/crm/accounts?id=${id}`, { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    return data.account
  } catch { return null }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const account = await getAccount(id)
  return { title: account ? account.name : 'Compte non trouve' }
}

export default async function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const account = await getAccount(id)
  if (!account) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/crm/accounts"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{account.name}</h1>
            {account.industry && <Badge variant="secondary" className="mt-1">{account.industry}</Badge>}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/crm/accounts/${id}/edit`}><Button variant="outline"><Edit className="mr-2 h-4 w-4" />Modifier</Button></Link>
          <Button variant="destructive" onClick={() => { if (confirm('Supprimer ce compte ?')) fetch(`/api/crm/accounts?id=${id}`, { method: 'DELETE' }).then(() => window.location.href='/crm/accounts') }}><Trash2 className="mr-2 h-4 w-4" />Supprimer</Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" />Informations du compte</CardTitle><CardDescription>Details de l&apos;entreprise</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {account.email && <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">Email</p><a href={`mailto:${account.email}`} className="text-blue-600 hover:underline">{account.email}</a></div></div>}
            {account.phone && <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">Telephone</p><a href={`tel:${account.phone}`} className="hover:underline">{account.phone}</a></div></div>}
            {account.website && <div className="flex items-center gap-3"><Globe className="h-4 w-4 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">Site web</p><a href={account.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{account.website}</a></div></div>}
            {account.address && <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">Adresse</p><p>{account.address}</p></div></div>}
            {account.description && <div className="col-span-full"><p className="text-sm text-muted-foreground mb-1">Description</p><p className="text-sm">{account.description}</p></div>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Contacts associes<Badge variant="secondary">{account.contacts.length}</Badge></CardTitle><CardDescription>Personnes de contact liees a ce compte</CardDescription></CardHeader>
        <CardContent>
          {account.contacts.length === 0 ? (
            <div className="text-center py-8"><Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" /><p className="text-muted-foreground">Aucun contact associe</p></div>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Nom</TableHead><TableHead>Email</TableHead><TableHead>Telephone</TableHead><TableHead>Poste</TableHead></TableRow></TableHeader>
              <TableBody>
                {account.contacts.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium"><Link href="/crm/contacts" className="hover:underline text-blue-600">{c.firstName} {c.lastName}</Link></TableCell>
                    <TableCell>{c.email ? <a href={`mailto:${c.email}`} className="text-blue-600 hover:underline">{c.email}</a> : '-'}</TableCell>
                    <TableCell>{c.phone || '-'}</TableCell>
                    <TableCell>{c.position || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
