<template>
  <div class="profile-page page-container">
    <h1>个人中心</h1>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>个人信息</span>
          <el-button v-if="!isEditing" type="primary" @click="startEdit">编辑</el-button>
          <div v-else>
            <el-button @click="cancelEdit">取消</el-button>
            <el-button type="primary" @click="saveProfile" :loading="loading">保存</el-button>
          </div>
        </div>
      </template>

      <el-form v-if="isEditing" :model="formData" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="formData.username" disabled />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="formData.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机">
          <el-input v-model="formData.phone" placeholder="请输入手机号" />
        </el-form-item>
      </el-form>

      <el-descriptions v-else :column="2" border>
        <el-descriptions-item label="用户名">
          {{ userStore.userInfo?.username }}
        </el-descriptions-item>
        <el-descriptions-item label="昵称">
          {{ userStore.userInfo?.nickname }}
        </el-descriptions-item>
        <el-descriptions-item label="邮箱">
          {{ userStore.userInfo?.email }}
        </el-descriptions-item>
        <el-descriptions-item label="手机">
          {{ userStore.userInfo?.phone || '未设置' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useUserStore } from '@/stores/user'
import { updateUser } from '@/api/auth'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const isEditing = ref(false)
const loading = ref(false)

const formData = reactive({
  username: '',
  nickname: '',
  email: '',
  phone: ''
})

const startEdit = () => {
  formData.username = userStore.userInfo?.username || ''
  formData.nickname = userStore.userInfo?.nickname || ''
  formData.email = userStore.userInfo?.email || ''
  formData.phone = userStore.userInfo?.phone || ''
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
}

const saveProfile = async () => {
  loading.value = true
  try {
    const formDataObj = new FormData()
    formDataObj.append('user', new Blob([JSON.stringify({
      nickname: formData.nickname,
      email: formData.email,
      phone: formData.phone
    })], { type: 'application/json' }))

    const res = await updateUser(formDataObj)
    if (res.code === 200) {
      ElMessage.success('个人信息更新成功')
      await userStore.fetchUserInfo()
      isEditing.value = false
    } else {
      ElMessage.error(res.msg || '更新失败')
    }
  } catch (error) {
    ElMessage.error('更新失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 24px;
}

h1 {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
