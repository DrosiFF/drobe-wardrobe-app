// Service container for dependency injection
export class ServiceContainer {
  private static instance: ServiceContainer
  
  // public readonly database: DatabaseService
  
  private constructor() {
    // Initialize database service
    // this.database = createDatabaseService()
    console.log('✅ Services initialized (AI services disabled)')
  }
  
  public static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer()
    }
    return ServiceContainer.instance
  }
  
  // public static get database(): DatabaseService {
  //   return ServiceContainer.getInstance().database
  // }
}

// Convenience exports
export const services = ServiceContainer.getInstance()
// export const databaseService = services.database

