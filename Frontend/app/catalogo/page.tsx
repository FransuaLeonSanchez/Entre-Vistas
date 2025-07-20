'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Star,
  Filter,
  ArrowUpDown,
  Badge,
  MessageCircle,
  User,
  Briefcase,
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Building,
  DollarSign
} from 'lucide-react'
import Avatar3D from '@/components/Avatar3D'
import UniformCard, { CardHeader, CardContent, CardFooter, TruncatedText } from '@/components/UniformCard'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const agents = [
  {
    id: 1,
    name: "Ana Vargas",
    specialty: "Tech Lead Frontend - BCP",
    description: "Especialista en entrevistas técnicas de React y Angular. Lidera el equipo de desarrollo frontend en BCP con experiencia en banca digital.",
    rating: 4.9,
    reviews: 89,
    price: "Gratis",
    tags: ["React", "Angular", "TypeScript", "Banca Digital"],
    badge: "BCP",
    badgeColor: "blue",
    avatar: "👩‍💻",
    experience: "Tech Lead en BCP",
    company: "BCP"
  },
  {
    id: 2,
    name: "Carlos Mendoza",
    specialty: "Senior Backend Engineer - BBVA",
    description: "Arquitecto de sistemas backend en BBVA. Especialista en microservicios, APIs RESTful y arquitecturas escalables para fintech.",
    rating: 4.8,
    reviews: 76,
    price: "Gratis",
    tags: ["Java", "Spring", "Microservicios", "AWS"],
    badge: "BBVA",
    badgeColor: "blue",
    avatar: "👨‍💼",
    experience: "Senior Engineer en BBVA",
    company: "BBVA"
  },
  {
    id: 3,
    name: "María Quispe",
    specialty: "Data Scientist - IBM Perú",
    description: "Lead Data Scientist en IBM con expertise en machine learning y análisis predictivo. Especialista en entrevistas de ciencia de datos.",
    rating: 5.0,
    reviews: 134,
    price: "Gratis",
    tags: ["Python", "Machine Learning", "IBM Watson", "Analytics"],
    badge: "Acceso Libre",
    badgeColor: "green",
    avatar: "👩‍🔬",
    experience: "Lead Data Scientist - IBM",
    company: "IBM"
  },
  {
    id: 4,
    name: "Diego Ramos",
    specialty: "Mobile Lead - Rappi Perú",
    description: "Líder de desarrollo móvil en Rappi. Especialista en arquitecturas móviles escalables para aplicaciones con millones de usuarios.",
    rating: 4.7,
    reviews: 92,
    price: "Gratis",
    tags: ["React Native", "Flutter", "iOS", "Android"],
    badge: "Rappi",
    badgeColor: "orange",
    avatar: "👨‍💻",
    experience: "Mobile Lead en Rappi",
    company: "Rappi"
  },
  {
    id: 5,
    name: "Sandra Torres",
    specialty: "DevOps Engineer - Interbank",
    description: "Ingeniera DevOps senior en Interbank. Experta en infraestructura cloud, CI/CD y automatización para sistemas bancarios críticos.",
    rating: 4.9,
    reviews: 67,
    price: "Gratis",
    tags: ["Kubernetes", "CI/CD", "Azure", "Docker"],
    badge: "Interbank",
    badgeColor: "green",
    avatar: "👩‍🚀",
    experience: "Senior DevOps - Interbank",
    company: "Interbank"
  },
  {
    id: 6,
    name: "Luis Herrera",
    specialty: "Security Lead - Scotiabank",
    description: "Jefe de Ciberseguridad en Scotiabank Perú. Especialista en seguridad bancaria, ethical hacking y compliance financiero.",
    rating: 4.8,
    reviews: 88,
    price: "Gratis",
    tags: ["Cybersecurity", "Ethical Hacking", "Compliance", "CISO"],
    badge: "Scotia",
    badgeColor: "red",
    avatar: "🛡️",
    experience: "Security Lead - Scotia",
    company: "Scotiabank"
  },
  {
    id: 7,
    name: "Andrea Salazar",
    specialty: "UX Lead - Yape BCP",
    description: "Líder de experiencia de usuario en Yape. Especialista en diseño centrado en el usuario para productos fintech innovadores.",
    rating: 4.9,
    reviews: 103,
    price: "Gratis",
    tags: ["UX Design", "Figma", "User Research", "Fintech"],
    badge: "Yape",
    badgeColor: "purple",
    avatar: "👩‍🎨",
    experience: "UX Lead en Yape",
    company: "Yape"
  },
  {
    id: 8,
    name: "Roberto Chávez",
    specialty: "Cloud Architect - Falabella",
    description: "Arquitecto de soluciones cloud en Falabella. Experto en migración digital y arquitecturas híbridas para retail y e-commerce.",
    rating: 4.6,
    reviews: 71,
    price: "Gratis",
    tags: ["AWS", "Azure", "Cloud Architecture", "E-commerce"],
    badge: "Falabella",
    badgeColor: "green",
    avatar: "☁️",
    experience: "Cloud Architect - Falabella",
    company: "Falabella"
  }
]

const specialties = ["Todos", "Frontend", "Backend", "Data Science", "Mobile", "DevOps", "Security", "UX/UI", "Cloud"]

const companies = ["todas", ...Array.from(new Set(agents.map(agent => agent.company)))]

export default function CatalogoPage() {
  const [selectedSpecialty, setSelectedSpecialty] = useState("Todos")
  const [sortBy, setSortBy] = useState("rating")
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [priceFilter, setPriceFilter] = useState("todos")
  const [ratingFilter, setRatingFilter] = useState(0)
  const [companyFilter, setCompanyFilter] = useState("todas")

<<<<<<< HEAD
  // Expand sidebar when component mounts
  useEffect(() => {
    window.dispatchEvent(new Event('expandSidebar'))
  }, [])

=======
>>>>>>> 5392eb5936b6096cb28c83eae18352196e64b35b
  const filteredAgents = agents
    .filter(agent => {
      // Filtro de búsqueda por texto
      const matchesSearch = searchTerm === "" || 
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        agent.company.toLowerCase().includes(searchTerm.toLowerCase())

      // Filtro de especialidad
      const matchesSpecialty = selectedSpecialty === "Todos" || 
        agent.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase()) ||
        agent.tags.some(tag => tag.toLowerCase().includes(selectedSpecialty.toLowerCase()))

      // Filtro de precio
      const matchesPrice = priceFilter === "todos" || 
        (priceFilter === "gratis" && agent.price === "Gratis") ||
        (priceFilter === "premium" && agent.price !== "Gratis")

      // Filtro de rating
      const matchesRating = ratingFilter === 0 || agent.rating >= ratingFilter

      // Filtro de empresa
      const matchesCompany = companyFilter === "todas" || 
        agent.company.toLowerCase().includes(companyFilter.toLowerCase())

      return matchesSearch && matchesSpecialty && matchesPrice && matchesRating && matchesCompany
    })
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating
      if (sortBy === "price") {
        const priceA = a.price === "Gratis" ? 0 : parseFloat(a.price)
        const priceB = b.price === "Gratis" ? 0 : parseFloat(b.price)
        return priceA - priceB
      }
      if (sortBy === "reviews") return b.reviews - a.reviews
      return 0
    })

  const getBadgeColors = (color: string) => {
    const colors: Record<string, string> = {
      gold: "bg-yellow-100 text-yellow-800",
      blue: "bg-blue-100 text-blue-800",
      purple: "bg-purple-100 text-purple-800",
      green: "bg-green-100 text-green-800",
      red: "bg-red-100 text-red-800",
      orange: "bg-orange-100 text-orange-800"
    }
    return colors[color] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="text-center space-y-4">
          <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Entrevistadores de Empresas
          </h1>
          <p className="text-xl text-gray-600">
            Encuentra el entrevistador técnico ideal para tu proceso de selección
          </p>
        </motion.div>

        {/* Buscador Avanzado */}
        <motion.div variants={fadeInUp} className="space-y-4">
          {/* Barra principal de búsqueda */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex gap-3">
              {/* Input de búsqueda */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, empresa, especialidad o tecnología..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>

              {/* Botón de filtros avanzados */}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border font-medium transition-all duration-200 ${
                  showAdvancedFilters || selectedSpecialty !== "Todos" || priceFilter !== "todos" || ratingFilter > 0 || companyFilter !== "todas"
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                <Filter className="w-5 h-5" />
                <span className="hidden sm:inline">Filtros</span>
                {showAdvancedFilters ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {/* Ordenar */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-700"
              >
                <option value="rating">⭐ Mejor Valorados</option>
                <option value="price">💰 Precio Más Bajo</option>
                <option value="reviews">📝 Más Reseñas</option>
              </select>
            </div>
          </div>

          {/* Panel de filtros avanzados desplegable */}
          {showAdvancedFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Filtro de Especialidad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Especialidad
                  </label>
                  <div className="space-y-2">
                    {specialties.map((specialty) => (
                      <label key={specialty} className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name="specialty"
                          value={specialty}
                          checked={selectedSpecialty === specialty}
                          onChange={(e) => setSelectedSpecialty(e.target.value)}
                          className="text-primary-500 focus:ring-primary-500"
                        />
                        <span>{specialty}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Filtro de Precio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Precio
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="price"
                        value="todos"
                        checked={priceFilter === "todos"}
                        onChange={(e) => setPriceFilter(e.target.value)}
                        className="text-primary-500 focus:ring-primary-500"
                      />
                      <span>Todos</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="price"
                        value="gratis"
                        checked={priceFilter === "gratis"}
                        onChange={(e) => setPriceFilter(e.target.value)}
                        className="text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-green-600">🆓 Gratis</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="price"
                        value="premium"
                        checked={priceFilter === "premium"}
                        onChange={(e) => setPriceFilter(e.target.value)}
                        className="text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-amber-600">⭐ Premium</span>
                    </label>
                  </div>
                </div>

                {/* Filtro de Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Rating Mínimo
                  </label>
                  <div className="space-y-2">
                    {[0, 4.5, 4.7, 4.8, 4.9].map((rating) => (
                      <label key={rating} className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name="rating"
                          value={rating}
                          checked={ratingFilter === rating}
                          onChange={(e) => setRatingFilter(parseFloat(e.target.value))}
                          className="text-primary-500 focus:ring-primary-500"
                        />
                        <span>
                          {rating === 0 ? "Cualquiera" : `${rating}+ ⭐`}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Filtro de Empresa */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Empresa
                  </label>
                  <div className="space-y-2">
                    {companies.map((company) => (
                      <label key={company} className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name="company"
                          value={company}
                          checked={companyFilter === company}
                          onChange={(e) => setCompanyFilter(e.target.value)}
                          className="text-primary-500 focus:ring-primary-500"
                        />
                        <span className="capitalize">
                          {company === "todas" ? "Todas" : company}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setSelectedSpecialty("Todos")
                    setPriceFilter("todos")
                    setRatingFilter(0)
                    setCompanyFilter("todas")
                    setSearchTerm("")
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Limpiar filtros
                </button>

                <div className="text-sm text-gray-600">
                  {filteredAgents.length} entrevistador{filteredAgents.length !== 1 ? 'es' : ''} encontrado{filteredAgents.length !== 1 ? 's' : ''}
                </div>
              </div>
            </motion.div>
          )}

          {/* Chips de filtros activos */}
          {(searchTerm || selectedSpecialty !== "Todos" || priceFilter !== "todos" || ratingFilter > 0 || companyFilter !== "todas") && (
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full">
                  🔍 &quot;{searchTerm}&quot;
                  <button onClick={() => setSearchTerm("")}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedSpecialty !== "Todos" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  💼 {selectedSpecialty}
                  <button onClick={() => setSelectedSpecialty("Todos")}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {priceFilter !== "todos" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  💰 {priceFilter === "gratis" ? "Gratis" : "Premium"}
                  <button onClick={() => setPriceFilter("todos")}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {ratingFilter > 0 && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                  ⭐ {ratingFilter}+
                  <button onClick={() => setRatingFilter(0)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {companyFilter !== "todas" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                  🏢 {companyFilter}
                  <button onClick={() => setCompanyFilter("todas")}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </motion.div>

        {/* Agents Grid - MINIMALISTA Y RESPONSIVE */}
        {filteredAgents.length === 0 ? (
          <motion.div 
            variants={fadeInUp}
            className="text-center py-12"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No se encontraron entrevistadores
            </h3>
            <p className="text-gray-600 mb-6">
              Intenta ajustar tus filtros o términos de búsqueda
            </p>
            <button
              onClick={() => {
                setSelectedSpecialty("Todos")
                setPriceFilter("todos")
                setRatingFilter(0)
                setCompanyFilter("todas")
                setSearchTerm("")
              }}
              className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Limpiar todos los filtros
            </button>
          </motion.div>
        ) : (
          <motion.div 
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
          {filteredAgents.map((agent, index) => (
            <UniformCard
              key={agent.id}
              height="md"
              variant="default"
              onClick={() => console.log(`Contactar a ${agent.name}`)}
            >
              <CardHeader className="text-center">
                {/* Avatar 3D Simplificado */}
                <div className="mb-3">
                  <Avatar3D
                    name={agent.name}
                    specialty={agent.specialty}
                    badge={agent.badge}
                    badgeColor={agent.badgeColor}
                    size="md"
                    mood="confident"
                  />
                </div>

                {/* Información básica */}
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
                  <p className="text-gray-600 text-sm">{agent.specialty}</p>
                  
                  {/* Rating simple */}
                  <div className="flex items-center justify-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{agent.rating}</span>
                    <span className="text-gray-400">({agent.reviews})</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* Descripción simplificada */}
                <TruncatedText lines={2} className="text-gray-600 text-sm mb-3 leading-relaxed">
                  {agent.description}
                </TruncatedText>

                {/* Tags minimalistas */}
                <div className="flex flex-wrap gap-1">
                  {agent.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                  {agent.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                      +{agent.tags.length - 3}
                    </span>
                  )}
                </div>
              </CardContent>

              <CardFooter>
                {/* Precio y acción simplificados */}
                <div className="flex items-center justify-between">
                  <div>
                    {agent.price === "Gratis" ? (
                      <>
                        <span className="text-lg font-bold text-green-600">Gratis</span>
                        <div className="text-xs text-green-500">Acceso libre</div>
                      </>
                    ) : (
                      <>
                        <span className="text-lg font-bold text-amber-600">${agent.price}</span>
                        <div className="text-xs text-amber-500">sesión premium</div>
                      </>
                    )}
                  </div>
                  
                  <button className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    agent.price === "Gratis" 
                      ? "bg-green-600 text-white hover:bg-green-700" 
                      : "bg-amber-600 text-white hover:bg-amber-700"
                  }`}>
                    Usar
                  </button>
                </div>

                {/* Experiencia */}
                <div className="text-center mt-2">
                  <span className="text-xs text-gray-500">{agent.experience}</span>
                </div>
              </CardFooter>
            </UniformCard>
          ))}
          </motion.div>
        )}

        {/* Load More Button */}
        <motion.div variants={fadeInUp} className="text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-secondary px-8 py-3"
          >
            Cargar Más Entrevistadores
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  )
} 