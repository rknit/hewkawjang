type Listener = () => void;

export default class AuthService {
  private static listeners = new Set<Listener>();

  static onAuthChange(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  static notifyAuthChange() {
    this.listeners.forEach((listener) => listener());
  }
}
