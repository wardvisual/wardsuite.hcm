import { getDb } from '@api/core/database/firestore.client';
import { User, UpdateUserDto } from '@api/types';

export class UsersService {
  private db = getDb();

  async findAll(): Promise<User[]> {
    const snap = await this.db.collection('users')
      .where('id', '!=', '_schema')
      .get();
    return snap.docs.map((d) => d.data() as User);
  }

  async findById(id: string): Promise<User> {
    const doc = await this.db.collection('users').doc(id).get();
    if (!doc.exists) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }
    return doc.data() as User;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const ref = this.db.collection('users').doc(id);
    const doc = await ref.get();

    if (!doc.exists) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }

    const updates: Partial<User> = {
      ...(dto as Partial<User>),
      updatedAt: new Date().toISOString(),
    };

    await ref.update(updates);
    return { ...(doc.data() as User), ...updates };
  }

  async delete(id: string): Promise<void> {
    const doc = await this.db.collection('users').doc(id).get();
    if (!doc.exists) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }
    await this.db.collection('users').doc(id).delete();
  }
}
