import { useLoaderData, useFetcher } from "@remix-run/react";
import { json } from "@remix-run/node";
import { prisma } from "~/utils/prismaClient";
import { loadUsers } from "~/models/users.server";

// Loader to fetch users
export const loader = async () => {
  const users = await loadUsers();
  return json({ users });
};

export default function Users() {
  const { users } = useLoaderData<{
    users: Array<{
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    }>;
  }>();
  const fetcher = useFetcher();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newUser = {
      firstName: formData.get("firstName")?.toString() || "",
      lastName: formData.get("lastName")?.toString() || "",
      email: formData.get("email")?.toString() || "",
    };
    fetcher.submit(newUser, { method: "post", action: "/api/users" });
  };

  return (
    <div>
      <h1>Users</h1>
      <form onSubmit={handleSubmit}>
        <label>
          First Name:
          <input type="text" name="firstName" required />
        </label>
        <label>
          Last Name:
          <input type="text" name="lastName" required />
        </label>
        <label>
          Email:
          <input type="email" name="email" required />
        </label>
        <button type="submit">Add User</button>
      </form>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.firstName} {user.lastName} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
