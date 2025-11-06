// Bank Connections Page
import { ConnectBank } from '@/components/ConnectBank'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function BankConnections() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Conexões Bancárias
            </h1>
            <p className="text-lg text-purple-200">
              Conecte suas contas bancárias para sincronização automática via Open Finance Brasil
            </p>
          </div>

          <ConnectBank />
        </div>
      </div>
    </div>
  )
}
